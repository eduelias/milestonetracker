/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";



var ethConnector = require('ethconnector');
var milestoneTrackerHelper = require('../js/milestonetracker_helper.js');
var vaultHelper = require('vaultcontract');
var BigNumber = require('bignumber.js');


var assert = require("assert"); // node.js core module
var async = require('async');
var _ = require('lodash');

var verbose = true;

describe('Normal Scenario Milestone test', function(){
    var vault;
    var milestoneTracker;
    var owner;
    var hatchCaller;
    var hatchReceiver;
    var guardian;
    var spender;
    var recipient;
    var guest;
    var arbitrator;
    var donor;
    var verifier;

    before(function(done) {
//        ethConnector.init('rpc', function(err) {
        ethConnector.init('testrpc' ,function(err) {
            if (err) return done(err);
            owner = ethConnector.accounts[0];
            hatchCaller = ethConnector.accounts[1];
            hatchReceiver = ethConnector.accounts[2];
            guardian = ethConnector.accounts[3];
            spender = ethConnector.accounts[4];
            recipient = ethConnector.accounts[5];
            guest = ethConnector.accounts[6];
            arbitrator = owner;
            donor =ethConnector.accounts[7];
            verifier = ethConnector.accounts[8];
            done();
        });
    });
    it('should deploy vault contracts ', function(done){
        this.timeout(20000000);
        var now = Math.floor(new Date().getTime() /1000);

        vaultHelper.deploy({
            escapeCaller: hatchCaller,
            escapeDestination: hatchReceiver,
            guardian: guardian,
            absoluteMinTimeLock: 86400,
            timeLock: 86400*2
        }, function(err, _vault) {
            assert.ifError(err);
            assert.ok(_vault.address);
            vault = _vault;
            done();
        });
    });
    it('should deploy milestoneTracker contracts ', function(done){
        this.timeout(20000000);
        var now = Math.floor(new Date().getTime() /1000);

        milestoneTrackerHelper.deploy({
            arbitrator: arbitrator,
            donor: donor,
            verifier: verifier,
            recipient: recipient,
            vault: vault.address
        }, function(err, _milestoneTracker) {
            assert.ifError(err);
            assert.ok(_milestoneTracker.address);
            milestoneTracker = _milestoneTracker;
            done();
        });
    });
 /*   it('Should send some Ether to the Vault', function(done) {
        vault.receiveEther({
            from: ethConnector.accounts[0],
            value: ethConnector.web3.toWei(50)
        }, function(err) {
            assert.ifError(err);
            ethConnector.web3.eth.getBalance(vault.address, function(err, _balance) {
                assert.ifError(err);
                assert.equal(ethConnector.web3.fromWei(_balance), 50);
                done();
            });
        });
    });
    it('Should not allow preparePayment', function(done) {
        vault.preparePayment(
            "testPayment",
            recipient,
            ethConnector.web3.toWei(10),
            "",
            86400*2,
            {
                from: spender,
                gas: 500000
            },
            function(err, res) {
                assert(err);
                done();
            }
        );
    });
    it('Should authorize spender', function(done) {
        vault.authorizeSpender(
            spender,
            true,
            {
                from: owner,
                gas: 200000
            },
            function(err) {
                assert.ifError(err);
                vault.allowedSpenders(spender, function(err, res) {
                    assert.ifError(err);
                    assert.equal(res,true);
                    done();
                });
            }
        );
    });
    it('Should allow preparePayment', function(done) {
        this.timeout(20000000);
        var now;
        vault.preparePayment(
            "testPayment",
            recipient,
            ethConnector.web3.toWei(10),
            "0x",
            86400*2,
            {
                from: spender,
                gas: 500000
            },
            function(err, res) {
                assert.ifError(err);
                async.series([
                    function(cb) {
                        vault.numberOfPayments(function(err, res) {
                            assert.ifError(err);
                            assert.equal(res, 1);
                            cb();
                        });
                    },
                    function(cb) {
                        ethConnector.web3.eth.getBlock('latest', function(err, _block) {
                            assert.ifError(err);
                            now = _block.timestamp;
                            cb();
                        });
                    },
                    function(cb) {
                        vault.payments(0, function(err, res) {
                            assert.ifError(err);
                            assert.equal(res[0], "testPayment");
                            assert.equal(res[1], spender);
                            assert.equal(res[2], now + 86400*2);
                            assert.equal(res[3], false);
                            assert.equal(res[4], false);
                            assert.equal(res[5], recipient);
                            assert.equal(ethConnector.web3.fromWei(res[6]), 10);
                            assert.equal(res[7], "0x");
                            cb();
                        });
                    }
                ],done);
            }
        );
    });
    it('Should desauthorize Spender', function(done) {
        vault.authorizeSpender(
            spender,
            false,
            {
                from: owner,
                gas: 200000
            },
            function(err) {
                assert.ifError(err);
                vault.allowedSpenders(spender, function(err, res) {
                    assert.ifError(err);
                    assert.equal(res,false);
                    done();
                });
            }
        );
    });
    it('Should not allow preparePayment adter desauthorizing', function(done) {
        vault.preparePayment(
            "testPayment",
            recipient,
            ethConnector.web3.toWei(10),
            "",
            86400*2,
            {
                from: spender,
                gas: 500000
            },
            function(err, res) {
                assert(err);
                done();
            }
        );
    });

    it('Should not allow executePayment', function(done) {
        vault.executePayment(
            0,
            {
                from: recipient,
                gas: 500000
            },
            function(err, res) {
                assert(err);
                done();
            }
        );
    });
    it('Should delay', function(done) {
        bcDelay(86400*2+1, done);
    });
    it('Should not allow executePayment if not authorized', function(done) {
        vault.executePayment(
            0,
            {
                from: recipient,
                gas: 500000
            },
            function(err, res) {
                assert(err);
                done();
            }
        );
    });
    it('Should reauthorize spender', function(done) {
        vault.authorizeSpender(
            spender,
            true,
            {
                from: owner,
                gas: 200000
            },
            function(err) {
                assert.ifError(err);
                vault.allowedSpenders(spender, function(err, res) {
                    assert.ifError(err);
                    assert.equal(res,true);
                    done();
                });
            }
        );
    });
    it('Should allow payment', function(done) {
        var beforeBalance;
        var afterBalance;
        async.series([
            function(cb) {
                ethConnector.web3.eth.getBalance(recipient, function(err, res) {
                    assert.ifError(err);
                    beforeBalance = res;
                    cb();
                });
            },
            function(cb) {
                vault.executePayment(
                    0,
                    {
                        from: guest,
                        gas: 500000
                    },
                    function(err, res) {
                        assert.ifError(err);
                        cb();
                    }
                );
            },
            function(cb) {
                ethConnector.web3.eth.getBalance(recipient, function(err, res) {
                    assert.ifError(err);
                    afterBalance = res;
                    var increment = afterBalance.sub(beforeBalance);
                    assert.equal(ethConnector.web3.fromWei(increment),10);
                    cb();
                });
            },
            function(cb) {
                vault.payments(0, function(err, res) {
                    assert.ifError(err);
                    assert.equal(res[3], false);
                    assert.equal(res[4], true);
                    cb();
                });
            }
        ], done);
    });
    it('Should not execute payment 2 times', function(done) {
        vault.executePayment(
            0,
            {
                from: recipient,
                gas: 500000
            },
            function(err, res) {
                assert(err);
                done();
            }
        );
    });
*/
    function bcDelay(secs, cb) {
        send("evm_increaseTime", [secs], function(err, result) {
            if (err) return cb(err);

      // Mine a block so new time is recorded.
            send("evm_mine", function(err, result) {
                if (err) return cb(err);
                cb();
            });
        });
    }

    function log(S) {
        if (verbose) {
            console.log(S);
        }
    }

        // CALL a low level rpc
    function send(method, params, callback) {
        if (typeof params == "function") {
          callback = params;
          params = [];
        }

        ethConnector.web3.currentProvider.sendAsync({
          jsonrpc: "2.0",
          method: method,
          params: params || [],
          id: new Date().getTime()
        }, callback);
    }
});
