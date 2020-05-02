import cron, { CronTime, CronCommand, CronJob, CronJobParameters } from 'cron';

type Time = string | moment.Moment;
interface IUpdateConfig {
  cronTime?: CronTime;
  job?: CronCommand;
}

export interface IManager {
  createJob: (name: string, cronTime: Time, job: CronCommand) => void;
  stopJob: (name: string) => void;
  updateJob: (name: string, config?: IUpdateConfig) => void;
  getJobs: () => string[];
}

const Jobs: { [key: string]: cron.CronJob } = {};

const Manager: IManager = {
  createJob(name: string, cronTime: Time, job: CronCommand): void {
    if (Jobs[name]) {
      throw new Error(`A job with the name ${name} already exists.`);
    }
    Jobs[name] = new CronJob(cronTime, job);
  },
  stopJob(name: string): void {
    if (!Jobs[name]) {
      throw new Error(`No job with the name ${name} exists.`);
    }
    Jobs[name].stop();
    Jobs[name] = undefined;
  },
  updateJob(name: string, config?: IUpdateConfig): void {
    const cronJob = Jobs[name];

    if (!cronJob) {
      throw new Error(`No job with the name ${name} exists.`);
    }

    const { cronTime, job } = config;
    if (job) cronJob.fireOnTick(job);
    if (cronTime) cronJob.setTime(cronTime);
  },
  getJobs: () => Object.keys(Jobs),
};

export default Manager;
