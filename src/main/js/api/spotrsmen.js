import client from '../client'
import { createClient } from 'hal-rest-client'

export function getSportsmen (url) {
    return createClient().fetchResource(url);
}
export default function fetchSportsmen () {
    return client({
        method: 'GET',
        path: 'http://10.37.129.2:8080/api/data/competitions/3/sportsmen'
    });
}
