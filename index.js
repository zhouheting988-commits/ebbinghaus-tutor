const { extensions, getMemory, setMemory } = require('../../../extensions.js');
const express = require('express');
const router = express.Router();

const EXTENSION_NAME = 'Ebbinghaus Tutor';
const MEMORY_KEY = 'ebbinghaus_tutor_data';

const defaultTables = {
    Vocabulary_Mastery: [
        { Day: 'Day 1', Level_0_New: '', Level_1: '', Level_2: '', Level_3: '', Level_4: '', Level_5_Mastered_Today: '' }
    ],
    Word_Lists: [
        { ListName: 'List1', Words: '' }
    ],
    Ebbinghaus_Schedule: [
        { Day: '1', NewList: 'List1', Review1: '', Review2: '', Review3: '', Review4: '', Review5: '' },
        { Day: '2', NewList: 'List2', Review1: 'List1', Review2: '', Review3: '', Review4: '', Review5: '' }
    ],
    Study_Control: [
        { Setting: 'Current_Day', Value: '1' },
        { Setting: 'Current_Round', Value: '1' }
    ]
};

async function getTutorData() {
    let data = await getMemory(MEMORY_KEY);
    if (!data) {
        console.log(`[${EXTENSION_NAME}] Initializing default tables.`);
        await setMemory(MEMORY_KEY, JSON.stringify(defaultTables));
        return defaultTables;
    }
    return JSON.parse(data);
}

async function saveTutorData(data) {
    await setMemory(MEMORY_KEY, JSON.stringify(data));
}

router.get('/gettables', async (req, res) => {
    try {
        const data = await getTutorData();
        res.json(data);
    } catch (error) {
        console.error(`[${EXTENSION_NAME}] Error getting tables:`, error);
        res.status(500).send('Error getting tables');
    }
});

router.post('/savetables', express.json(), async (req, res) => {
    try {
        const newData = req.body;
        await saveTutorData(newData);
        res.status(200).send('Tables saved successfully');
    } catch (error) {
        console.error(`[${EXTENSION_NAME}] Error saving tables:`, error);
        res.status(500).send('Error saving tables');
    }
});

function setup() {
    extensions.register(EXTENSION_NAME, 'backend', {
        mount: (app) => {
            app.use(`/extensions/${EXTENSION_NAME}`, router);
            app.use(`/extensions/${EXTENSION_NAME}/public`, express.static(__dirname + '/public'));
        },
        display: {
            innerHTML: `<iframe src="/extensions/${EXTENSION_NAME}/public/index.html" style="width: 100%; height: 100%; border: none;"></iframe>`
        }
    });
}

module.exports = {
    setup
};
