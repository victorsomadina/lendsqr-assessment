import { expect } from "chai";
import "reflect-metadata";
import * as sinon from "sinon";
import { WalletService } from "../../../src/app/user/services/WalletService";
import { WalletFactory } from "../factories/WalletFactory";
import { TransactionType } from "../../../src/app/user/entities/Transaction";

describe("WalletService", function () {
    this.timeout(10000);
    let walletService: WalletService;
    let dbStub: any;

    beforeEach(() => {
        dbStub = sinon.stub() as any;
        dbStub.transaction = sinon.stub();
        walletService = new WalletService(dbStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("fundAccount", () => {
        it("should successfully fund an account", async () => {
            const userId = "user-123";
            const amount = 5000;
            const wallet = WalletFactory.createWallet({ userId, balance: 1000 });

            const trx: any = sinon.stub().returns({
                where: sinon.stub().returnsThis(),
                forUpdate: sinon.stub().returnsThis(),
                first: sinon.stub().resolves(wallet),
                update: sinon.stub().resolves(),
                insert: sinon.stub().resolves()
            });
            dbStub.transaction.callsFake(async (callback: any) => await callback(trx));

            const result = await walletService.fundAccount(userId, amount);

            expect(result.balance).to.equal(6000);
            expect(trx.calledWith("wallets")).to.be.true;
            expect(trx.calledWith("transactions")).to.be.true;
        });

        it("should throw error for negative amount", async () => {
            try {
                await walletService.fundAccount("user-123", -100);
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.equal("Funding amount must be greater than zero.");
            }
        });

        it("should throw error if wallet not found", async () => {
            const trx: any = sinon.stub().returns({
                where: sinon.stub().returnsThis(),
                forUpdate: sinon.stub().returnsThis(),
                first: sinon.stub().resolves(null)
            });
            dbStub.transaction.callsFake(async (callback: any) => await callback(trx));

            try {
                await walletService.fundAccount("user-123", 1000);
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.equal("Wallet not found for this user.");
            }
        });
    });

    describe("transferFunds", () => {
        it("should successfully transfer funds between accounts", async () => {
            const senderId = "sender-123";
            const recipientAccountNumber = "9876543210";
            const amount = 2000;

            const senderWallet = WalletFactory.createWallet({ userId: senderId, balance: 5000 });
            const receiverWallet = WalletFactory.createWallet({ accountNumber: recipientAccountNumber, balance: 1000 });

            const trx: any = sinon.stub();
            const queryStub = {
                where: sinon.stub().returnsThis(),
                forUpdate: sinon.stub().returnsThis(),
                first: sinon.stub(),
                update: sinon.stub().resolves(),
                insert: sinon.stub().resolves(),
                select: sinon.stub().resolves([WalletFactory.createTransaction({
                    amount,
                    transactionType: TransactionType.TRANSFER,
                    senderWalletId: senderWallet.id,
                    receiverWalletId: receiverWallet.id
                })])
            };

            queryStub.first.onFirstCall().resolves(senderWallet);
            queryStub.first.onSecondCall().resolves(receiverWallet);

            trx.returns(queryStub);
            dbStub.transaction.callsFake(async (callback: any) => await callback(trx));

            const result = await walletService.transferFunds(senderId, { recipientAccountNumber, amount });

            expect(result.amount).to.equal(amount);
            expect(result.transactionType).to.equal(TransactionType.TRANSFER);
        });

        it("should throw error for insufficient funds", async () => {
            const senderId = "sender-123";
            const senderWallet = WalletFactory.createWallet({ userId: senderId, balance: 500 });

            const trx: any = sinon.stub();
            const queryStub = {
                where: sinon.stub().returnsThis(),
                forUpdate: sinon.stub().returnsThis(),
                first: sinon.stub().resolves(senderWallet)
            };
            trx.returns(queryStub);
            dbStub.transaction.callsFake(async (callback: any) => await callback(trx));

            try {
                await walletService.transferFunds(senderId, { recipientAccountNumber: "123", amount: 1000 });
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.equal("Insufficient funds.");
            }
        });

        it("should throw error if recipient not found", async () => {
            const senderId = "sender-123";
            const senderWallet = WalletFactory.createWallet({ userId: senderId, balance: 5000 });

            const trx: any = sinon.stub();
            const queryStub = {
                where: sinon.stub().returnsThis(),
                forUpdate: sinon.stub().returnsThis(),
                first: sinon.stub()
            };
            queryStub.first.onFirstCall().resolves(senderWallet);
            queryStub.first.onSecondCall().resolves(null);

            trx.returns(queryStub);
            dbStub.transaction.callsFake(async (callback: any) => await callback(trx));

            try {
                await walletService.transferFunds(senderId, { recipientAccountNumber: "999", amount: 1000 });
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.equal("Recipient account not found.");
            }
        });
    });

    describe("withdrawFunds", () => {
        it("should successfully withdraw funds", async () => {
            const userId = "user-123";
            const amount = 1000;
            const wallet = WalletFactory.createWallet({ userId, balance: 5000 });

            const trx: any = sinon.stub();
            const queryStub = {
                where: sinon.stub().returnsThis(),
                forUpdate: sinon.stub().returnsThis(),
                first: sinon.stub().resolves(wallet),
                update: sinon.stub().resolves(),
                insert: sinon.stub().resolves(),
                select: sinon.stub().resolves([WalletFactory.createTransaction({
                    amount,
                    transactionType: TransactionType.WITHDRAWAL,
                    senderWalletId: wallet.id
                })])
            };
            trx.returns(queryStub);
            dbStub.transaction.callsFake(async (callback: any) => await callback(trx));

            const result = await walletService.withdrawFunds(userId, { amount });

            expect(result.amount).to.equal(amount);
            expect(result.transactionType).to.equal(TransactionType.WITHDRAWAL);
        });

        it("should throw error for insufficient funds on withdrawal", async () => {
            const userId = "user-123";
            const wallet = WalletFactory.createWallet({ userId, balance: 500 });

            const trx: any = sinon.stub();
            const queryStub = {
                where: sinon.stub().returnsThis(),
                forUpdate: sinon.stub().returnsThis(),
                first: sinon.stub().resolves(wallet)
            };
            trx.returns(queryStub);
            dbStub.transaction.callsFake(async (callback: any) => await callback(trx));

            try {
                await walletService.withdrawFunds(userId, { amount: 1000 });
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.contain("Insufficient funds");
            }
        });
    });
});
