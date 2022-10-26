import * as moment from 'moment';

export { printLog, getLogOptions };

function printLog(data: {
  startTime: [number, number];
  srvProvider: string;
  service: string;
  statusCode: string;
  message?: string;
}) {
  const { startTime, srvProvider, service, statusCode, message } = data;
  const elapsedTime = process.hrtime(startTime);
  const elapsedTimeInMs = Math.ceil(
    elapsedTime[0] * 1e3 + elapsedTime[1] / 1e6
  );
  const currentTime = moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss Z');
  let logTemplate = `[SERVICE][${currentTime}][${srvProvider}][${service}]: ${statusCode} ${elapsedTimeInMs}ms`;
  if (message) logTemplate = `${logTemplate} ${message}`;
  console.log(logTemplate);
}

function getLogOptions(data: { srvProvider: string; service: string }) {
  return {
    startTime: process.hrtime(),
    srvProvider: data.srvProvider,
    service: data.service,
    statusCode: '200',
  };
}
