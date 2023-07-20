const { login } = require("../contollers/contollers");
const util = require("../util/util");

jest.mock("../util/util", () => ({
  userlogin: jest.fn(),
}));

const req = { body: { email: "psarisa@gmail.com", password: "sai@123" } };
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  send: jest.fn(),
};

test("login should return user data if password and email are correct", () => {
  util.userlogin.mockImplementation((user, callback) => {
    callback(null, [{ id: 1, name: "Prakash" }]);
  });
  login(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith([{ id: 1, name: "Prakash" }]);
});

test("login should return if the user data is invalid or incorrect", () => {
  util.userlogin.mockImplementation((user, callback) => {
    callback(null, []);
  });
  login(req, res);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.send).toHaveBeenCalledWith({
    message: "Invalid Email ID or Password!",
  });
});
