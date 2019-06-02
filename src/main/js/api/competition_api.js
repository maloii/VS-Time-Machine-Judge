import client from '../client'
import Settings from '../settings'
import { createClient } from 'hal-rest-client'

export function getCompetitions () {
    return createClient(Settings.root).fetchResource('/competitions');
}

export function getGates (url) {
    return client({
        method: 'GET',
        path: url
    });
}
