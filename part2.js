import http from 'k6/http';
import exec from 'k6/execution';
import { group } from 'k6';

export const options = {
  scenarios: {
    ya: {
      executor: 'ramping-arrival-rate',
      exec: 'getYa',
      startRate: 0,
      timeUnit: '1m',
      preAllocatedVUs: 20,

      stages: [
        { target: 60, duration: '5m' },
        { target: 60, duration: '10m' },
        { target: 72, duration: '5m' },
        { target: 72, duration: '10m' },
      ],
    },
    www: {
        executor: 'ramping-arrival-rate',
        exec: 'getWWW',
        startRate: 0,
        timeUnit: '1m',
        preAllocatedVUs: 20,
  
        stages: [
          { target: 120, duration: '5m' },
          { target: 120, duration: '10m' },
          { target: 144, duration: '5m' },
          { target: 144, duration: '10m' },
        ],
      },
    },
};
export function getYa(){
    http.get('https://ya.ru/');
}

export function getWWW(){
    http.get('http://www.ru/');
}

export default function () {
    group('ya.ru', () => { getYa(); });
    group('www.ru', () => { getWWW(); });
}
