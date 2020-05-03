"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = require("cron");
const Jobs = {};
const Manager = {
    createJob(name, cronTime, job) {
        if (Jobs[name]) {
            throw new Error(`A job with the name ${name} already exists.`);
        }
        Jobs[name] = new cron_1.CronJob(cronTime, job);
    },
    stopJob(name) {
        if (!Jobs[name]) {
            throw new Error(`No job with the name ${name} exists.`);
        }
        Jobs[name].stop();
        Jobs[name] = undefined;
    },
    updateJob(name, config) {
        const cronJob = Jobs[name];
        if (!cronJob) {
            throw new Error(`No job with the name ${name} exists.`);
        }
        const { cronTime, job } = config;
        if (job)
            cronJob.fireOnTick(job);
        if (cronTime)
            cronJob.setTime(cronTime);
    },
    getJobs: () => Object.keys(Jobs),
};
exports.default = Manager;
//# sourceMappingURL=live-game-jobs-manager.js.map