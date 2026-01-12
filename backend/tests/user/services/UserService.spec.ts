import { expect } from "chai";
import "reflect-metadata";
import * as sinon from "sinon";
import { UserService } from "../../../src/app/user/services/UserService";
import { AdjutorService } from "../../../src/app/user/services/AdjutorService";
import { UserFactory } from "../factories/UserFactory";
import bcrypt from "bcryptjs";

describe("UserService", function () {
    this.timeout(10000);
    let userService: UserService;
    let dbStub: any;
    let adjutorServiceStub: sinon.SinonStubbedInstance<AdjutorService>;

    beforeEach(() => {
        dbStub = sinon.stub() as any;
        dbStub.transaction = sinon.stub();

        adjutorServiceStub = sinon.createStubInstance(AdjutorService);

        userService = new UserService(dbStub, adjutorServiceStub as any);
    });
    afterEach(() => {
        sinon.restore();
    });

    describe("createAccount", () => {
        it("should successfully create a user account", async () => {
            const signupInput = UserFactory.createSignupInput();

            const queryStub = {
                where: sinon.stub().returnsThis(),
                first: sinon.stub().resolves(null),
                insert: sinon.stub().resolves(),
                select: sinon.stub().returnsThis()
            };
            dbStub.withArgs("users").returns(queryStub);

            adjutorServiceStub.isBlacklisted.resolves(false);

            const trx: any = sinon.stub().returns({
                insert: sinon.stub().resolves(),
                where: sinon.stub().returns({
                    select: sinon.stub().resolves([UserFactory.createUser({ email: signupInput.email })])
                })
            });
            dbStub.transaction.callsFake(async (callback: any) => await callback(trx));

            const result = await userService.createAccount(signupInput);

            expect(result).to.have.property("email", signupInput.email);
            expect(result).to.have.property("accountNumber");
            expect(adjutorServiceStub.isBlacklisted.calledOnceWith(signupInput.email)).to.be.true;
        });

        it("should throw error if email already exists", async () => {
            const signupInput = UserFactory.createSignupInput();
            const existingUser = UserFactory.createUser({ email: signupInput.email });

            const queryStub = {
                where: sinon.stub().returnsThis(),
                first: sinon.stub().resolves(existingUser)
            };
            dbStub.withArgs("users").returns(queryStub);

            try {
                await userService.createAccount(signupInput);
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.equal("A user with this email already exists.");
            }
        });

        it("should throw error if user is blacklisted", async () => {
            const signupInput = UserFactory.createSignupInput();

            const queryStub = {
                where: sinon.stub().returnsThis(),
                first: sinon.stub().resolves(null)
            };
            dbStub.withArgs("users").returns(queryStub);

            adjutorServiceStub.isBlacklisted.resolves(true);

            try {
                await userService.createAccount(signupInput);
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.contain("based on credit history");
            }
        });
    });

    describe("login", () => {
        it("should successfully login a user", async () => {
            const loginInput = { email: "test@example.com", password: "password123" };
            const hashedPassword = await bcrypt.hash(loginInput.password, 10);
            const user = UserFactory.createUser({ email: loginInput.email, password: hashedPassword });

            const queryStub = {
                where: sinon.stub().returnsThis(),
                first: sinon.stub().resolves(user)
            };
            dbStub.withArgs("users").returns(queryStub);

            const result = await userService.login(loginInput);

            expect(result).to.have.property("user");
            expect(result).to.have.property("token");
            expect(result.user.email).to.equal(loginInput.email);
        });

        it("should throw error for invalid password", async () => {
            const loginInput = { email: "test@example.com", password: "wrongpassword" };
            const hashedPassword = await bcrypt.hash("correctpassword", 10);
            const user = UserFactory.createUser({ email: loginInput.email, password: hashedPassword });

            const queryStub = {
                where: sinon.stub().returnsThis(),
                first: sinon.stub().resolves(user)
            };
            dbStub.withArgs("users").returns(queryStub);

            try {
                await userService.login(loginInput);
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.equal("Invalid email or password.");
            }
        });

        it("should throw error if user not found", async () => {
            const loginInput = { email: "nonexistent@example.com", password: "password123" };

            const queryStub = {
                where: sinon.stub().returnsThis(),
                first: sinon.stub().resolves(null)
            };
            dbStub.withArgs("users").returns(queryStub);

            try {
                await userService.login(loginInput);
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.equal("Invalid email or password.");
            }
        });
    });
});
