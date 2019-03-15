'use strict';

class Settings {
    constructor() {
        this.root = '/api/data';
        this.raceApiRoot = '/api/race';
        this.raceApiReport = '/api/report';

        this.channelNumber = {
            R1: 5658,
            R2: 5695,
            R3: 5732,
            R4: 5769,
            R5: 5806,
            R6: 5843,
            R7: 5880,
            R8: 5917,

            A1: 5865,
            A2: 5845,
            A3: 5825,
            A4: 5805,
            A5: 5785,
            A6: 5765,
            A7: 5745,
            A8: 5725,

            B1: 5733,
            B2: 5752,
            B3: 5771,
            B4: 5790,
            B5: 5809,
            B6: 5828,
            B7: 5847,
            B8: 5866,

            E1: 5705,
            E2: 5685,
            E3: 5665,
            E4: 5645,
            E5: 5885,
            E6: 5905,
            E7: 5925,
            E8: 5945,

            F1: 5740,
            F2: 5760,
            F3: 5780,
            F4: 5800,
            F5: 5820,
            F6: 5840,
            F7: 5860,
            F8: 5880
        }
    }
    
}
export default (new Settings);
