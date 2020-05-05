import cron, { CronTime, CronCommand, CronJob, CronJobParameters } from 'cron';
import logger, { Level } from './../logger/Logger';

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
      logger.log(
        Level.INFO,
        `tried to start a job ${name}, but one already exists`,
        {
          name,
        }
      );
      return;
    } else {
      logger.log(Level.INFO, `starting job for ${name}`, { name });
      Jobs[name] = new CronJob(cronTime, job);
    }
  },
  stopJob(name: string): void {
    if (!Jobs[name]) {
      logger.log(Level.INFO, `tried to stop a non-existent job for ${name}`, {
        name,
      });
      return;
    } else {
      logger.log(Level.INFO, `stopping job for ${name}`, { name });
      Jobs[name].stop();
      Jobs[name] = undefined;
    }
  },
  updateJob(name: string, config?: IUpdateConfig): void {
    const cronjob = Jobs[name];

    if (!cronjob) {
      logger.log(
        Level.INFO,
        `tried to update config for non-existent ${name}`,
        { ...config, name }
      );
      return;
    } else {
      logger.log(Level.INFO, `updating config for job ${name}`, {
        ...config,
        name,
      });
      const { cronTime, job } = config;
      if (job) cronjob.fireOnTick(job);
      if (cronTime) cronjob.setTime(cronTime);
    }
  },
  getJobs: () => Object.keys(Jobs),
};

export default Manager;
