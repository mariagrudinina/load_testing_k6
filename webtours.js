import http from 'k6/http';
import { parseHTML } from 'k6/html';

import { check, group } from 'k6';
import { SharedArray } from 'k6/data';


const data = new SharedArray('get Users', function(){
    const file = JSON.parse(open('./users.json'));
    return file.users;
});

const BASE_URL = 'http://webtours.load-test.ru:1080';
export function check200(res){
    check(res, {
        'status code is 200': (res) => res.status === 200,
      });
}

export function checkWelcome(res, user){  
    check(res, {
        'verify homepage text': (r) =>
          r.body.includes('Welcome, <b>'+user['username']+'</b>,'),
      });
}

export const options = {
  //  vus:5,
  //  duration: '20s',
      thresholds: {
        http_req_duration: ['p(95)<3000'],
      },
    };
export function openHomepage() {
    const res1 = http.get(`${BASE_URL}/webtours/`);
    check200(res1);

    const res2 = http.get(`${BASE_URL}/webtours/header.html`);
    check200(res2);

    const res3 = http.get(`${BASE_URL}/cgi-bin/welcome.pl?signOff=true`);
    check200(res3);

    const res4 = http.get(`${BASE_URL}/webtours/images/hp_logo.png`);
    check200(res4);

    const res5 = http.get(`${BASE_URL}/webtours/images/webtours.png`);
    check200(res5);

    const res6 = http.get(`${BASE_URL}/WebTours/home.html`);
    check200(res6);
    check(res6, {
        'verify homepage text': (r) =>
          r.body.includes('Welcome to the Web Tours site'),
        });

    const res7 = http.get(`${BASE_URL}/cgi-bin/nav.pl?in=home`);
    check200(res7);
    const doc = parseHTML(res7.body);
    const userSession = doc.find('input[name="userSession"]').attr('value');

    const res8 = http.get(`${BASE_URL}/WebTours/images/mer_login.gif`);
    check200(res8);
    return userSession;
}

export function login(userSession){
    const user = data[Math.floor(Math.random() * data.length)];
    let userData = { 
        userSession: userSession, 
        username: user['username'],
        password: user['password'],
        'login.x': '61',
        'login.y': '12',
        JSFormSubmit: 'off'
    };

    const res1 = http.post(`${BASE_URL}/cgi-bin/login.pl`, userData);
    check200(res1);

    const res2 = http.get(`${BASE_URL}/cgi-bin/nav.pl?page=menu&in=home`);
    check200(res2);

    const res3 = http.get(`${BASE_URL}/cgi-bin/login.pl?intro=true`);
    check200(res3);
    checkWelcome(res3, user);

    const res4 = http.get(`${BASE_URL}/WebTours/images/flights.gif`);
    check200(res4);

    const res5 = http.get(`${BASE_URL}/WebTours/images/signoff.gif`);
    check200(res5);

    const res6 = http.get(`${BASE_URL}/WebTours/images/itinerary.gif`);
    check200(res6);

    const res7 = http.get(`${BASE_URL}/WebTours/images/in_home.gif`);
    check200(res7);
    return user;
}  

export function getFlight(){
    const res1 = http.get(`${BASE_URL}/cgi-bin/welcome.pl?page=search`);
    check200(res1);

    const res2 = http.get(`${BASE_URL}/cgi-bin/nav.pl?page=menu&in=flights`);
    check200(res2);

    const res3 = http.get(`${BASE_URL}/cgi-bin/reservations.pl`);
    check200(res3);
    const doc = parseHTML(res3.body);
    const departCities = doc.find('select[name=\"depart\"]>option').toArray();
    const randDepartCity = departCities[Math.floor(Math.random() * departCities.length)].attr('value');
    const arrivalCities = doc.find('select[name=\"arrive\"]>option').toArray();
    let i = 0;
    let randArrivalCity;
    do {
        randArrivalCity = arrivalCities[Math.floor(Math.random() * arrivalCities.length)].attr('value');
         i += 1;
        } while (i < 10 && randArrivalCity===randDepartCity);

    const res4 = http.get(`${BASE_URL}/WebTours/images/home.gif`);
    check200(res4);
         
    const res5 = http.get(`${BASE_URL}/WebTours/images/in_flights.gif`);
    check200(res5);
 
    const res6 = http.get(`${BASE_URL}/WebTours/images/button_next.gif`);
    check200(res6);
    return [randDepartCity, randArrivalCity];
}

export function buyTicket(outboundFlightRandom){
    let flightData = {
        firstName: 'Maria',
        lastName: 'Test',
        address1: 'address example',
        address2: '644000',
        pass1: 'Maria Test',
        creditCard: '',
        expDate: '',
        oldCCOption: '',
        numPassengers: '1',
        seatType: 'Coach',
        seatPref: 'None',
        outboundFlight:  outboundFlightRandom,
        advanceDiscount: '0',
        returnFlight: '',
        JSFormSubmit: 'off',
        'buyFlights.x': '17',
        'buyFlights.y': '5',
        '.cgifields': 'saveCC'
    };
    
    const res1 = http.post(`${BASE_URL}/cgi-bin/reservations.pl`, flightData);
    check200(res1);

    const res2 = http.get(`${BASE_URL}/WebTours/images/bookanother.gif`);
    check200(res2);
}

export function goToHomepage(user){
    const res1 = http.get(`${BASE_URL}/cgi-bin/welcome.pl?page=menus`);
    check200(res1);

    const res2 = http.get(`${BASE_URL}/cgi-bin/login.pl?intro=true`);
    check200(res2);
    checkWelcome(res2, user);

    const res3 = http.get(`${BASE_URL}/cgi-bin/nav.pl?page=menu&in=home`);
    check200(res3);
}

export default function(){
    let userSession, randomUser, cities, flightData;
    group('Open Homepage', () => { userSession = openHomepage()});
    group('Login', () => { randomUser = login(userSession)});
    group('Get Flights', () => { cities = getFlight()});
    flightData = { 
        advanceDiscount: '0', 
        depart: cities[0],
        departDate: '05/25/2022',
        arrive: cities[1],
        returnDate: '05/26/2022',
        numPassengers: '1',
        seatPref: 'None',
        seatType: 'Coach',
        'findFlights.x': '39',
        'findFlights.y': '10',
        '.cgifields': 'roundtrip',
        '.cgifields': 'seatType',
        '.cgifields': 'seatPref'
    };

    const res1 = http.post(`${BASE_URL}/cgi-bin/reservations.pl`, flightData);
    check200(res1);
    const doc = parseHTML(res1.body);
    const outboundFlights = doc.find('input[name="outboundFlight"]').toArray();
    const outboundFlightRandom = outboundFlights[Math.floor(Math.random() * outboundFlights.length)].attr('value');

    flightData = { 
        outboundFlight: outboundFlightRandom,
        numPassengers: '1',
        advanceDiscount: '0', 
        seatType: 'Coach',
        seatPref: 'None',
        'reserveFlights.x': '39',
        'reserveFlights.y': '4'

    };

    const res2 = http.post(`${BASE_URL}/cgi-bin/reservations.pl`, flightData);
    check200(res2);
    group('Buy a ticket', () => { buyTicket(outboundFlightRandom)});
    group('Go to homepage', () =>{ goToHomepage(randomUser)});
}