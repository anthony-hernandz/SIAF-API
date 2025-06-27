import 'dotenv/config';
import * as joi from 'joi';

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    DB_HOST: joi.string().required(),
    DB_NAME: joi.string().required(),
    DB_PORT: joi.number().required(),
    DB_USER: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    JWT_EXPIRATION: joi.string().required(),
    JWT_REFRESH_EXPIRATION: joi.string().required(),
    JWT_USE_REFRESH_TOKEN: joi.boolean().required(),
    SMTP_HOST: joi.string().required(),
    SMTP_USER: joi.string().required(),
    SMTP_PASS: joi.string().required(),
    SMTP_PORT: joi.number().required(),
    MAIL_HOST: joi.string().required(),
    MAIL_USER: joi.string().required(),
    MAIL_PASSWORD: joi.string().required(),
    MAIL_FROM: joi.string().required(),
    MAIL_PORT: joi.number().required(),
    MAIL_RECOVER_PASSWORD_TIME_SECONDS: joi.number().required(),
    MAX_ATTEMPS_RECOVER_PASSWORD_MAIL: joi.number().required(),
    URL_APPLICATION_FRONT: joi.string().required(),
    NODE_ENV: joi.string().required(),
    AWS_S3_BUCKET: joi.string().optional(),
    AWS_S3_REGION: joi.string().optional(),
    AWS_ACCESS_KEY_ID: joi.string().optional(),
    AWS_SECRET_ACCESS_KEY: joi.string().optional(),
    STORAGE_DRIVER: joi.string().optional(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars = value;

export const envs = {
  port: envVars.PORT,
  postgres: {
    dbHost: envVars.DB_HOST,
    dbName: envVars.DB_NAME,
    dbPort: envVars.DB_PORT,
    dbUser: envVars.DB_USER,
    dbPassword: envVars.DB_PASSWORD,
  },
  jwtSecret: envVars.JWT_SECRET,
  jwtExpiration: envVars.JWT_EXPIRATION,
  jwtRefreshExpiration: envVars.JWT_REFRESH_EXPIRATION,
  jwtUseRefreshToken: envVars.JWT_USE_REFRESH_TOKEN,
  smtpHost: envVars.SMTP_HOST,
  smtpUser: envVars.SMTP_USER,
  smtpPass: envVars.SMTP_PASS,
  smtpPort: envVars.SMTP_PORT,
  emailFrom: envVars.MAIL_FROM,
  maxAttempsRecoverPasswordEmail: envVars.MAX_ATTEMPS_RECOVER_PASSWORD_MAIL,
  emailRecoverPasswordTime: envVars.MAIL_RECOVER_PASSWORD_TIME_SECONDS,
  urlApplicationFront: envVars.URL_APPLICATION_FRONT,
  nodeEnv: envVars.NODE_ENV,
  storageDriver: envVars.STORAGE_DRIVER || 'local',
  aws: {
    s3Bucket: envVars.AWS_S3_BUCKET,
    region: envVars.AWS_S3_REGION,
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
  },
};
