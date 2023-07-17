const botcontroller = require("../controllers/bot.controller.js");
const BotFeedback = require("../models/botFeedback.model");
const usercount = require("../controllers/metrics.controller");
var async = require("async");
const {
  getMessageLength,
  getConversationLength,
  getConversationAndMessagesCount,
} = require("./metrics.controller.js");
const { unrecognizedUtterances } = require("./exports.controller");
const logger = require("../_log/logger_def.js");
const Bot = require("../models/bot.model");
const request = require("request");
const { json } = require("express");
const jnjBaseUrl = process.env.environment;
const jnjAuth = process.env.environmentKey;
const axios = require("axios");

const Conversation = require("../models/conversation.model");

const BotOpsMetrics = {
  convoResult: async function (botId) {
    return new Promise((resolve, reject) => {
      usercount
        .calculateUsersAndConversationAggregation(botId, 9)
        .then((data) => {
          let uniqueUsers = data[0].usersCount;
          let lastDaysPipe = data[0].lastNineDays;
          aggregationResult = {
            userVisits: uniqueUsers,
            lastNineDays: lastDaysPipe,
          };
          aggregationResult.array_lastNineDays = [];
          aggregationResult.array_lastNineDaysConversations = [];
          aggregationResult.array_lastNineDaysUsers = [];
          aggregationResult.lastNineDays.forEach((day) => {
            aggregationResult.array_lastNineDays.push(day.date);
            aggregationResult.array_lastNineDaysConversations.push(
              day.conversations
            );
            aggregationResult.array_lastNineDaysUsers.push(day.usersCount);
          });
          resolve(aggregationResult);
        })
        .catch((err) => {
          logger.error("Error aggregating the data : " + err);
        });
    });
  },
  transferCount: async function (botId) {
    return new Promise((resolve, reject) => {
      var options = {
        url:
          jnjBaseUrl +
          'api/entity/gtg_chatbots_tbl?&where={"id":"' +
          botId +
          '"}',
        headers: {
          Authorization: jnjAuth,
        },
        json: true,
      };
      //console.log(options)
      request.get(options, async (err, response, body) => {
        var transfercount;
        if (err) {
          //console.log(err)
        }
        if (typeof body[0] === "undefined") {
          //console.log(`working`)
          resolve(0);
        } else {
          if (body[0].hasOwnProperty("liveAgentEnabled")) {
            //console.log("live agent enabled")
            if (body[0].liveAgentEnabled) {
              // call live agent api
              transfercount = await BotOpsMetrics.getCount(
                body[0].liveAgentHostUrl
              );
              //console.log(transfercount)
              resolve(transfercount);
            } else {
              resolve(0);
            }
          } else {
            //console.log("enable:", body[0].liveAgentEnabled)
            resolve(transfercount);
          }
        }
      });
    });
  },
  getCount: async function (liveAgentHostUrl) {
    var options = {
      url: liveAgentHostUrl + "/convos/metrics/overview",
      // url : "https://gtg-live-agent-testing-bot-dev-api.appserviceenvmultina.na.ase.jnj.com/convos/metrics/overview"
    };
    //console.log(`options  =  ${options}`)
    return new Promise((resolve, reject) => {
      request.get(options, async (err, response, body) => {
        //console.log(response)
        if (err) {
          //console.log(err)
          resolve(0);
        } else {
          //console.log("body:", body)
          //  console.log("response:",response)
          resolve(JSON.parse(body).Total);
        }
      });
    });
  },
  getUnrecognizedList: async function (botId) {
    Conversation.aggregate([
      { $match: { owner: botId } },
      { $unwind: "$messages" },
      { $sort: { createdAt: -1 } },
      {
        $match: {
          $and: [
            {
              "messages.dialogId": "null",
            },
            {
              $and: [
                {
                  "messages.remapDialogId": {
                    $exists: false,
                  },
                },
                {
                  $and: [
                    {
                      $or: [
                        {
                          "messages.ignore": false,
                        },
                        {
                          "messages.ignore": null,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        $group: {
          _id: "$_id",
          messages: {
            $push: {
              convObjId: "$_id",
              id: "$messages.id",
              text: "$messages.text",
              dialogId: "$messages.dialogId",
              channel: "$messages.channel",
              remapDialogId: "$messages.remapDialogId",
              conversationid: "$messages.conversationID",
              userinfo: "$messages.user",
              ignore: "$messages.ignore",
            },
          },
        },
      },
    ]);
  },
  metricsGatherer: async function (botId) {
    var tempdata = {};
    data = await Bot.findById(botId);
    //console.log("------", data)
    tempdata["transferCount"] = await BotOpsMetrics.transferCount(botId);
    //console.log(tempdata["transferCount"])
    if (data != null) {
      let messageLength = await getConversationAndMessagesCount(data._id);
      if (messageLength.length > 0) {
        if (messageLength[0].messageLength.length > 0) {
          data["messagesLength"] = messageLength[0].messageLength[0].messages;
          data["conversationLength"] =
            messageLength[0].conversationLength[0].conversationId;
        } else {
          data["messagesLength"] = 0;
          data["conversationLength"] = 0;
        }
      } else {
        data["messagesLength"] = 0;
        data["conversationLength"] = 0;
      }
    } else {
      logger.error("Could not find bot with that ID.");
      return {};
    }
    tempdata["convoResult"] = await BotOpsMetrics.convoResult(botId);
    //console.log('tempdata', tempdata)
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url:
        jnjBaseUrl +
        "public/serverscript/apiservicewithserverscripts/getUtterancesCountByBotId?botId=" +
        botId,
    };

    let uttercount = await axios.request(config);
    let urutterance = await unrecognizedUtterances(
      botId,
      new Date("01 june 2013 14:48 UTC").toISOString(),
      new Date("31 December 2030 14:48 UTC").toISOString()
    ).then((response) => {
      count = 0;
      for (i = 0; i < response.length; i++) {
        count += response[i].messages.length;
      }
      return count;
    });
    // let urutterance = await BotOpsMetrics.getUnrecognizedList(botId)
    let recurringUser = 0,
      nonrecurringUser = 0;
    //console.log((typeof tempdata.convoResult.userVisits[0].count === "undefined") ? 0 : tempdata.convoResult.userVisits[0].count)
    if (tempdata.convoResult.hasOwnProperty("userVisits")) {
      if (tempdata.convoResult.userVisits.length > 0) {
        if (tempdata.convoResult.userVisits[0].hasOwnProperty("count")) {
          recurringUser = tempdata.convoResult.userVisits[0].count;
        }
      }
      if (tempdata.convoResult.userVisits.length > 1) {
        if (tempdata.convoResult.userVisits[1].hasOwnProperty("count")) {
          nonrecurringUser = tempdata.convoResult.userVisits[1].count;
        }
      }
    }
    value = {
      botId: botId,
      botName: data.name,
      numberOfUsers: recurringUser + nonrecurringUser,
      numberOfRecurringUsers: recurringUser,
      numberOfConversations: data.conversationLength,
      numberOfMessages: data.messagesLength,
      numberOfCallsTransferredToLiveAgent: tempdata.transferCount,
      numberOfUnrecognizedUtterance: urutterance,
      numberOfTrainedUtterances: {
        dialogs: uttercount.data.response.luisCount,
        faq: uttercount.data.response.qnaCount,
      },
      averageConvoLen: Number(data.messagesLength / data.conversationLength),
      avgBotRating: Number(data.feedbackRatingSum) / Number(data.feedbackCount),
    };
    console.log(value);

    return value;
  },
  getBotOpsMetrics: async function (req, res) {
    try {
      botsIds = [];
      response = [];
      bots = await Bot.find();
      for (i = 0; i < bots.length; i++) {
        botsIds.push(bots[i]._id);
      }
      for (i = 0; i < botsIds.length; i++) {
        try {
          console.log(`pushing ${i} ${botsIds[i]}`);
          response.push(await BotOpsMetrics.metricsGatherer(botsIds[i]));
          console.log(`pushed ${i}`);
        } catch (e) {
          console.log(e);
        }
      }
      res.status(200).json({ message: "Record fetch success", data: response });
    } catch (e) {
      res.status(200).json({ message: "Record fetch unsuccessful", data: e });
    }
  },
};

module.exports = BotOpsMetrics;
