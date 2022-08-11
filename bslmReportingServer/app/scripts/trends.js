'use strict';

const graphDataPointOverTime = (predicate, storeFile) => {

    const buildSnapShotRec = (storeFileIndex = 0, accSnapshot = [], accGraphData = []) => {
        if (storeFileIndex === storeFile.userDiffs.length) return accGraphData;
        const newSnapshot = incrementUserSnapshot(storeFile.userDiffs[storeFileIndex], accSnapshot);
        const matchingUsers = newSnapshot.filter(user => predicate(user));
        const graphData = {
            date: storeFile.userDiffs[storeFileIndex].date,
            amount: matchingUsers.length
        }
        return buildSnapShotRec(storeFileIndex + 1, newSnapshot, [...accGraphData, graphData]);
    }
    return buildSnapShotRec();

}