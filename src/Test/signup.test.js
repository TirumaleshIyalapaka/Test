const { signup } = require("../contollers/contollers");
const util = require("../util/util");

jest.mock("../util/util", () => ({
  usersignup: jest.fn(),
}));

const req = {
  body: {
    username: "test",
    email: "test@gmail.com",
    phone: "9000590005",
    password: "password",
    retailer: "true",
  },
};

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

test("Inserts user data into the database", () => {
  util.usersignup.mockImplementation((user, callback) => {
    // const userID = "Hello_123";
    callback(null, ["Inserted into the database"]);
  });

  signup(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith("Data inserted successfully.");
});

test("An error Occured and data not inserted into the database", () => {
  util.usersignup.mockImplementation((user, callback) => {
    callback(new Error("User creation failed"));
  });
  signup(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith("An error Occured!");
});
