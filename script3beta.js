var searchTime = 15000;
var searchInterval = setInterval(getDocumentAndSearch, searchTime);

var startTime, startTimeSet, currentTime;
var running = false;
var wasRun = false;
var audioEnabledBool = false;

var numInBatch = 0;
var numProvisioning = 0;
var numCompletedProvisioning = 0;
var numFailedProvisioning = 0;
var numPreMigrating = 0;
var numWaitingToPreMigrate = 0;
var numCompletedPreMigrating = 0;
var numFailedPreMigrating = 0;
var numBatchesCompleted = 0;
var numLedgersCompleted = 0;

var averageTimeArray = [];
var averageTimeSum = 0;
var averageTime = 0;

var dataTable = document.getElementsByClassName("label default purple MainPage_button__2JikY")[0];
var parentNode = document.getElementsByClassName("flx-template__body")[0];
var runningHTML = document.createElement("div");
var runningHTMLBaseText = `<hr /><h1>Search active</h1>`;

runningHTML.setAttribute("id", "runningSearch");
runningHTML.setAttribute("style", "text-align: center");
runningHTML.innerHTML = runningHTMLBaseText + "<hr />";
parentNode.insertBefore(runningHTML, dataTable);

var extraOptionsDiv = document.createElement("div");
extraOptionsDiv.setAttribute("id", "Extras");
parentNode.insertBefore(extraOptionsDiv, runningHTML);

var averageTimeMessage = "Average time: Will display after a batch is complete.";
var averageTimeDiv = document.createElement("div");
averageTimeDiv.innerHTML = averageTimeMessage;
extraOptionsDiv.appendChild(averageTimeDiv);

var batchesThisSessionHTML = "Completed batches (ledgers) this session: ";
var batchesCountDiv = document.createElement("div");
batchesCountDiv.innerHTML = batchesThisSessionHTML + numBatchesCompleted.toString() + " (" + numLedgersCompleted.toString() + ")";
extraOptionsDiv.appendChild(batchesCountDiv);

var optionsVisible = false;
var optionsButton = document.createElement("button");
optionsButton.innerHTML = "View Options";
optionsButton.addEventListener("click", changeOptionsVisible);
extraOptionsDiv.appendChild(optionsButton);

var audioEnabledButton = document.createElement("button");
var audioEnabledBool = false;
audioEnabledButton.innerHTML = "Enable audio";
audioEnabledButton.addEventListener("click", changeAudioEnabled);

var editCountButton = document.createElement("button");
editCountButton.addEventListener("click", editCount);
editCountButton.innerHTML = "Edit count";

var editSearchTimeButton = document.createElement("button");
editSearchTimeButton.addEventListener("click", editSearchTime);
editSearchTimeButton.innerHTML = "Interval";

var resetAverageTimeButton = document.createElement("button");
resetAverageTimeButton.addEventListener("click", resetAverageTimeHandler);
resetAverageTimeButton.innerHTML = "Reset average";

var clearCookiesButton = document.createElement("button");
clearCookiesButton.addEventListener("click", deleteAllCookies);
clearCookiesButton.innerHTML = "Reset all data";

checkCookie();

function changeOptionsVisible() {
	optionsVisible = !optionsVisible;

	if (optionsVisible) {
		optionsButton.innerHTML = "Hide Options";
		extraOptionsDiv.appendChild(audioEnabledButton);
		extraOptionsDiv.appendChild(editCountButton);
		extraOptionsDiv.appendChild(editSearchTimeButton);
		extraOptionsDiv.appendChild(resetAverageTimeButton);
		extraOptionsDiv.appendChild(clearCookiesButton);
	} else {
		optionsButton.innerHTML = "Show Options";
		extraOptionsDiv.removeChild(audioEnabledButton);
		extraOptionsDiv.removeChild(editCountButton);
		extraOptionsDiv.removeChild(editSearchTimeButton);
		extraOptionsDiv.removeChild(resetAverageTimeButton);
		extraOptionsDiv.removeChild(clearCookiesButton);
	}
}

function changeAudioEnabled() {
    audioEnabledBool = !audioEnabledBool;

    if (audioEnabledBool) {
        audioEnabledButton.innerHTML = "Disable Audio";
    } else {
        audioEnabledButton.innerHTML = "Enable Audio";
    }
}

function editCount() {
	var editBatchesCount = 0;
	var editLedgersCount = 0;

	editBatchesCount = prompt("How many batches have you completed today?", "0");
	if (editBatchesCount == null || editBatchesCount === "") {
		return;
	}

	editLedgersCount = prompt("How many ledgers have you completed today?", "0");
	if (editLedgersCount == null || editLedgersCount === "") {
		return;
	}

	if (confirm(`Are you sure you want to continue?\n\nChanges:\nBatches: ${editBatchesCount.toString()} (Was ${numBatchesCompleted})\nLedgers: ${editLedgersCount.toString()} (Was ${numLedgersCompleted})`)) {
		editBatchesCount = parseInt(editBatchesCount);
		editLedgersCount = parseInt(editLedgersCount);
		
		numBatchesCompleted = editBatchesCount;
		numLedgersCompleted = editLedgersCount;
		batchesCountDiv.innerHTML = `${batchesThisSessionHTML} ${numBatchesCompleted.toString()} (${numLedgersCompleted.toString()})`;
		
		setCookie("batchesComplete", editBatchesCount);
		setCookie("ledgersComplete", editLedgersCount);
	}
}

function editSearchTime() {
	var newSearchTime = 0;

	newSearchTime = prompt("Please enter your desired search interval (in whole seconds)", `${searchTime / 1000}`);
	if (newSearchTime == null || newSearchTime === "") {
        return;
	}
	if (newSearchTime > 60) {
        alert("That interval is invalid. Please try again.");
        return;
	}

	newSearchTime = parseInt(newSearchTime);
	searchTime = newSearchTime * 1000;
	setCookie("searchInterval", searchTime);
}

function resetAverageTimeHandler() {
	averageTimeArray = [];
	averageTime = 0;
	averageTimeSum = 0;
	averageTimeMessage = "Average time: Will display after a batch is complete."
}

function setCookie(cname, cvalue) {
	var expires = "";
	var date = new Date();
	var midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
	expires = "expires=" + midnight.toGMTString();

	document.cookie = "Trin-" + cname + "=" + cvalue + "; " + expires + "; path=/";
}

function getCookie(cname) {
    var name = "Trin-" + cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var CbatchesComplete = getCookie("batchesComplete");
    var CledgersComplete = getCookie("ledgersComplete");
    var cSearchTime = getCookie("searchInterval");
    var CaverageTime = getCookie("averageTime");
    var CaverageTimeArray = getCookie("averageTimeArray");

    if (CbatchesComplete != "") {
        numBatchesCompleted = cBatchesComplete;
    }
    if (CledgersComplete != "") {
        numLedgersCompleted = CledgersComplete;
    }
    if (cSearchTime != "") {
        searchTime = cSearchTime;
    }
    if (CaverageTime != "" && CaverageTimeArray != "") {
        setAverageTime(CaverageTimeArray, CaverageTime, undefined)
    }
}

function deleteAllCookies() {
    document.cookie = "Trin-batchesComplete=;Expires=Thu, 01 Jan 1970 00:00:01 GMT;Path=/"
    document.cookie = "Trin-ledgersComplete=;Expires=Thu, 01 Jan 1970 00:00:01 GMT;Path=/"
    document.cookie = "Trin-searchInterval=;Expires=Thu, 01 Jan 1970 00:00:01 GMT;Path=/"
    document.cookie = "Trin-averageTime=;Expires=Thu, 01 Jan 1970 00:00:01 GMT;Path=/"

    batchesThisSessionCount = 0;
    ledgersThisSessionCount = 0;
    batchesCountDiv.innerHTML = batchesThisSessionHTML + numBatchesCompleted.toString() + " (" + numLedgersCompleted.toString() + ")";

    searchTime = 15000;

    setAudioEnabled(false);

    resetAverageTimeHandler();
}

function setStartTime() {
	if (running) {
		if (!startTimeSet && !wasRun) {
			startTime = new Date();
			startTimeSet = true;
		}
	}
}

function getDocumentAndSearch() {
    numInBatch = 0;

    numProvisioning = 0;
	numCompletedProvisioning = 0;
	numFailedProvisioning = 0;

	numPreMigrating = 0;
    numWaitingToPreMigrate = 0;
	numCompletedPreMigrating = 0;
	numFailedPreMigrating = 0;

	var documentToSearch = document.getElementsByClassName("table-data__cell");

    for (var i = 0; i < documentToSearch.length; i++) {
        // Provisioning
        if (documentToSearch[i].innerText.indexOf("Provision database") > -1) {
            provisionDatabase(documentToSearch[i], documentToSearch[i+1], documentToSearch[i+2]);
        } else if (documentToSearch[i].innerText.indexOf("Pre-migration") > -1) {
            preMigrate(documentToSearch[i], documentToSearch[i+1], documentToSearch[i+2]);
        }
    }
}

function displayText(stage) {
    var numInProgressText = "";
	var numCompletedText = "";
	var numFailedText = "";
    var numWaitingText = "";
	var currentTime = new Date();

    timeTaken = calculateDuration(currentTime - startTime);

    if (stage.innerText.indexOf("Provision Database") > -1) {
        // Display the current results of the provision.
        if (numProvisioning >= 1) {
            numInProgressText = `Found ${numProvisioning.toString()} ${(numProvisioning > 1 ? 'ledgers' : 'ledger')} in progress.`;
        }
        if (numCompletedProvisioning >= 1) {
            numCompletedText = `Found ${numCompletedProvisioning.toString()} ${(numCompletedProvisioning > 1 ? 'ledgers' : 'ledger')} completed.`;
        }
        if (numFailedProvisioning >= 1) {
            numFailedText = `Found ${numFailedProvisioning.toString()} ${(numFailedProvisioning > 1 ? 'ledgers' : 'ledger')} failed.`;
        }

        runningHTML.innerHTML = 
        `${runningHTMLBaseText}
        ${(numFailedProvisioning > 0) ? numFailedText + '<br />' : ''}
        ${(numProvisioning > 0) ? numInProgressText + '<br />' : ''}
        ${(numCompletedProvisioning > 0) ? numCompletedText + '<br />' : ''}
        Time elapsed: ${(timeTaken != '') ? timeTaken : '< 1 minute'} <hr />`;
    } else if (stage.innerText.indexOf("Pre-migration") > -1) { 
        // Display the current results of the pre-migration.
        if (numPreMigrating >= 1) {
            numInProgressText = `Found ${numPreMigrating.toString()} ${(numPreMigrating > 1 ? 'ledgers' : 'ledger')} in progress.`;
        }
        if (numCompletedPreMigrating >= 1) {
            numCompletedText = `Found ${numCompletedPreMigrating.toString()} ${(numCompletedPreMigrating > 1 ? 'ledgers' : 'ledger')} completed.`;
        }
        if (numFailedPreMigrating >= 1) {
            numFailedText = `Found ${numFailedPreMigrating.toString()} ${(numFailedPreMigrating > 1 ? 'ledgers' : 'ledger')} failed.`;
        }
        if (numWaitingToPreMigrate >= 1) {
            numWaitingText = `Found ${numWaitingToPreMigrate.toString()} ${(numWaitingToPreMigrate > 1 ? 'ledgers' : 'ledger')} waiting to begin.`;
        }

        runningHTML.innerHTML = 
        `${runningHTMLBaseText}
        ${(numWaitingToPreMigrate > 0) ? numWaitingText + '<br />' : ''}
        ${(numPreMigrating > 0) ? numInProgressText + '<br />' : ''}
        ${(numFailedPreMigrating > 0) ? numFailedText + '<br />' : ''}
        ${(numCompletedPreMigrating > 0) ? numCompletedText + '<br />' : ''}
        Time elapsed: ${(timeTaken != '') ? timeTaken : '< 1 minute'}<hr />`;
    }
}

function setAverageTime(array, avg, cTime) {
    if (!typeof array === undefined && !typeof avg === undefined) {
        averageTimeArray = array;
        averageTime = avg;   
        averageTimeMessage = `Average time: ${calculateDuration(averageTime)}`;
        averageTimeDiv.innerHTML = averageTimeMessage;     
    }
    
    if (!typeof cTime === undefined) {
        averageTimeArray.push(cTime - startTime);
        for (var i = 0; i < averageTimeArray.length; i++) {
            averageTimeSum += averageTimeArray[i];
        }
        averageTime = (averageTimeSum / averageTimeArray.length);
        averageTimeMessage = `Average time: ${calculateDuration(averageTime)}`;
        averageTimeDiv.innerHTML = averageTimeMessage;

        // Set cookies
        setCookie("averageTimeArray", averageTimeArray);
        setCookie("averageTime", averageTime)
    }
}

function finishBatch(stage) {
    currentTime = new Date();
    timeMessage = `${calculateDuration(currentTime - startTime)}`;

    wasRun = true;
    startTimeSet = false;

    if (stage.innerText.indexOf("Provision database") > -1) {
        var alertMessage = `Provisioning complete.\nTime taken: ${timeMessage}`;
        runningHTML.innerHTML = `<hr /><h1>Provisioning complete. Awaiting user input</h1><hr />`;
        if (audioEnabled) {
            playProvisionComplete();
        }
        alert(alertMessage);
    } else if (stage.innerText.indexOf("Pre-migration") > -1) {
        var alertMessage  = `Batch complete.\nTotal time taken: ${timeMessage}`;
        runningHTML.innerHTML = `<hr /><h1>Batch complete. Awaiting new batch</h1><hr />`;
        if (audioEnabled) {
            playMigrationComplete();
        }
        numBatchesCompleted += 1;
        numLedgersCompleted += numInBatch;
        batchesCountDiv.innerHTML = batchesThisSessionHTML + numBatchesCompleted.toString() + " (" + numLedgersCompleted.toString() + ")";

        setAverageTime(undefined, undefined, currentTime)
        alert(alertMessage);
    }


}

function provisionDatabase(stage, step, status) {
    currentTime = new Date();

    if (step.innerText.indexOf("Upload Ledger") > -1) {
        if ((status.innerText.indexOf("Started") > -1) 
        || (status.innerText.indexOf("In progress") > -1) 
        || (status.innerText.indexOf("Completed") > -1)) {
            // We've only just started this batch. Set running to true, set the start time.
            // Start time will only be set once, even though it's called n times.
            running = true;
            wasRun = false;
            setStartTime();

            numInBatch += 1;
            numProvisioning += 1;
        }
    } else if (step.innerText.indexOf("Provisioning database") > -1) {
        if ((status.innerText.indexOf("Started") > -1) 
        || (status.innerText.indexOf("In progress") > -1)) {
            // We've only just started this batch. Set running to true, set the start time.
            // This is duplicated from "Upload Ledger" to make sure it's caught correctly.
            running = true;
            wasRun = false;
            setStartTime();

            numInBatch += 1;
            numProvisioning += 1;
        } else if (status.innerText.indexOf("Completed") > -1) {
            // Provisioning has completed for this ledger. Note it and move on/
            numInBatch += 1;
            numCompletedProvisioning += 1;
        } else if (status.innerText.indexOf("Failed") > -1) {
            // Provisioning has failed for this ledger. Note it and move on.
            numInBatch += 1;
            numFailedProvisioning += 1;
        }
    }

        // Display status in UI.
        displayText(stage);

        // Check if: wasRun is false, and if the number in batch 
        // is equal to the number completed + the number failed.
        if (!wasRun && ((numCompletedProvisioning + numFailedProvisioning) === numInBatch)) {
            finishBatch(stage);
        }
}

function preMigrate(stage, step, status) {
    currentTime = new Date();

    if (step.innerText.indexOf("Pre ETL migration") > -1
    || (step.innerText.indexOf("Pre migration") > -1)) {
        if ((status.innerText.indexOf("Waiting for resource") > -1) 
        || (status.innerText.indexOf("Remove from queue") > -1)) {
            // Pre-migration has not yet started. Add to number waiting, and set the start time.
            running = true;
            wasRun = false;
            setStartTime();
            
            numInBatch += 1;
            numWaitingToPreMigrate += 1;
        } else if (status.innerText.indexOf("Started") > -1) {
            // Pre-migration has started. Note it and move on.
            running = true;
            wasRun = false;
            setStartTime();

            numInBatch += 1;
            numPreMigrating += 1;
        } else if (status.innerText.indexOf("In progress") > -1) {
            // Pre-migration is in progress. Note it and move on.
            numInBatch += 1;
            numPreMigrating += 1;
        } else if ((status.innerText.indexOf("Completed") > -1)
        || (status.innerText.indexOf("Pre Access Management") > -1)) {
            // This ledger is complete. Note it and move on.
            numInBatch += 1;
            numCompletedPreMigrating += 1;
        } else if (status.innerText.indexOf("Failed") > -1) {
            // This ledger has failed. Note it and move on.
            numInBatch += 1;
            numFailedPreMigrating += 1;
        }

        // Display status in UI.
        displayText(stage);

        // Check if: wasRun is false, and if the number in batch 
        // is equal to the number completed + the number failed.
        if (!wasRun && ((numCompletedPreMigrating + numFailedPreMigrating) === numInBatch)) {
            finishBatch(stage);
        }
    }
}

function calculateDuration(timeString) {
	var rawMS = timeString;

	var rawSeconds = Math.floor(rawMS / 1000);
	if (rawSeconds >= 1) rawMS -= (rawSeconds * 1000);

	var rawMinutes = Math.floor(rawSeconds / 60);
	if (rawMinutes >= 1) rawSeconds -= (rawMinutes * 60);

	var rawHours = Math.floor(rawMinutes / 60);
	if (rawHours >= 1) rawMinutes -= (rawHours * 60);

	var rawDays = Math.floor(rawHours / 24);
	if (rawDays >= 1) rawHours -= (rawDays * 24);

	var messageToReturn = "";

	if (rawDays >= 1) messageToReturn += `${rawDays} ${(rawDays > 1) ? 'days' : 'day'}, `;
	if (rawHours >= 1) messageToReturn += `${rawHours} ${(rawHours > 1) ? 'hours' : 'hour'}, `;
	if (rawMinutes > 1) messageToReturn += `${rawMinutes} ${(rawMinutes > 1) ? 'minutes' : 'minute'}.`;

	return messageToReturn;
}

function playMigrationComplete() {
	var snd = new Audio(
		"data:audio/mpeg;base64,//MQZAAAAAGkAAAAAAAAA0gAAAAAAAEAYcD/8xBkBQAAAaQAAAAAAAADSAAAAABYcComE//zEGQKAAABpAAAAAAAAANIAAAAAIdAQA2i//MQZA8AAAGkAAAAAAAAA0gAAAAAEQXA9gP/8xBkFAAAAaQAAAAAAAADSAAAAADC3A7Kn//zEGQZAAABpAAAAAAAAANIAAAAAAHDAtN4//MQZB4AAAGkAAAAAAAAA0gAAAAAyCMBkYD/8xBkIwAAAaQAAAAAAAADSAAAAABkQINsPf/zEGQoAAABpAAAAAAAAANIAAAAAEgGRw+c//MQZC0AAAGkAAAAAAAAA0gAAAAAaXjjTTP/8xBkMgAAAaQAAAAAAAADSAAAAABwUDjPAP/zEGQ3AAABpAAAAAAAAANIAAAAADBA1d/b//MQZDwAAAGkAAAAAAAAA0gAAAAADAIARcD/8xBkQQAAAaQAAAAAAAADSAAAAABQGJsKv//zEGRGAAABpAAAAAAAAANIAAAAANSDGmwB//MQZEsAAAGkAAAAAAAAA0gAAAAAQgWQN4H/8xBkUAAAAaQAAAAAAAADSAAAAABCgavEfv/zEGRVAAAAXgCggAAAAANIAUAAADn/9aZo//NwZFoWLgEZL8pQAJBCWiT/gTgAnW6BfCxsW8KGgM8cEYhYmFmwxuBrgn/9I0Q0LNQZMTmHpiEIsZ8h4foOaUwxoN0PzK3///+30y4Zl8dpPqKhmRciZODnkHSR///////KhwnH6DVIG+Vx4JCBAAgGAwFAQA9D+/Af+36N///88wbkzP/8XnkyxQfBx//+IgsGgscqTlv///8bucpM1DDzlB4W//8PNIChcvKKCa1SS23eqw//83BkCBJJ52Z/5hgBhWACeAfAEAKAIQyiImxtRahOUbj8rB5SbQr7cQL37nYnd6///2JWCDCe/t3bf3ovsT/3NKx2ZWt9ITq8iH3X12+lc1ZSjDBZiCgv3ZBilWfXuVsT+/E877s7DZ86DPHaDkPf3/s+kHJ/suJ3v2j7rtbs3+l9mvv8WoxkP/je8++s/ZkPd3uy24hfZDehQ039zPVAF3////////////////u3IvR13d+qCP/zoGQBG63fQgZzTD4ICAI4BgBEuJ6LINHgKBIBpZpEnmXwUDgsZiFRgIMMTBBFMchsaZglEZhOZ9COBjEwD0xzitTFnTSJg5I5KdDC0l0KEVWLp7rrYGoHCH2ZfctW5dZZQu8unfZOyNSAEVFxEjH2p7c72pT2m59HkUDc93YleetaN9ObnATiWIXltuJfGx70FIvJ6OOq47iaN1l/WRQS50Nt1yb5vxdbqzBaP9m97w3zdas8+7tFmQ5SOv/sFM6a51ZymZedvk7X9mk17d+jydUtVg3hqv7JyGcrz93tb6vZScpNYs7+pAeBtovebmVgBz////////////9lYYlxAXKF//tv3YVlA6Lp9u2Qtqox3yS68zO28I2tYGYiTluXPQlsDxsnjTzOK2jEGjNhLQIA0vYT4zf/83BkJxUB52QbYYtnhbKePAYABRxTDkDr7Omdq+vbtyQsD6My2+P9q/m+xj97P/98xUvNzoEAJoIpHJGXviqN6PGbgTzSKSObvi+++Z7g7nuviaQWpn1E7euom90aV1cd01zOe4nj1pmmRUUsS2qndPitXWMScNw6LN+qnet99w13ujdNP+2VS6JEFMeiQWrIx3vKnf0Ei///KVGcKJMSakJTr////6CXSDnspgZMTltv6lixxP/zkGQJFh3vbi89LeeL/BZABgFN0FQwGh09P4p81spjjVklpU69J4wypQnZkIRFjSq831OiEwoLodp4xt6qNxlQTLAmi5/z+2RomsW+de3//////1uXcwQkX6tVLkoJazzK9ehCEGg4G2I1SO09r/5TugQ7vuyM/O93c/j7zxd9+y8PVf55rty2Pv16d/X/3bzJURlCFE48K6Tp4oOoiWCvDeU59NC//b/96aKCkjiBOGsfhKCt0zSCkU3f9Ah9v/62//////+3//////9dfQ8iuKM4gIi5wgpR44Px9gcRK2aP4+9v4zybK2qsOhDThWBLgiQOYUNmbWICqC0xho6iuZpNnP/zkGQYGo3vTAJt56iJkeY4AACToPCIGl48X1HQkxIZMsEyI4VhV0YsKmNEoG6BLXMEJTHlgxcSBScYGumeiYYVusmi1Qy8XYEKiCGhhoYPExtyYAS4wcUMbHExUHkfywtqnhxTj+IkSLLCv43i09fneY1Mwd2tTx5I0U9i3F9FtVZCFUX93Jp7K3zxZpIbA8ajshPNxa/O7fqramqSMroz/VG17PKDs4/TZ0tOVEUyLGMMmocp3qTUaD42c0t//r//0nrzjzR4akRaCwN0j/x9f/UF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"
	);
	snd.play();
}

function playProvisionComplete() {
	var snd = new Audio(
		"data:audio/mpeg;base64,SUQzBAAAAAABFVRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzb21tcDQyAFRERU4AAAAVAAADMjAxNC0wOC0xOSAwMToxNzoyNABUU1NFAAAADwAAA0xhdmY1My4zMi4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhpbmcAAAAHAAAEMQAG2XcAAwUICg0QEhUYGRwfISQnKSwuMDM2ODs+QUJFSEpNUFJVV1lcX2FkZ2lrbnBzdnh7foCChYiKjZCSlJeZnJ+hpKeoq66ws7a4u73AwsXIys3Q0dTX2dzf4eTm6Ovu8PP2+Pr9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7kGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjk5LjNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk5LjNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7kmRAj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OS4zVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+5JkQI/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTkuM1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//uSZECP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk5LjNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7kmRAj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVGDQFwWCkMgwGYMAMAmPBibGh+xuwMxni9ItRq3H1jcDK5EoCyB5RtIrTIH1O5uRbZsW2ZuXDtK00Lh2mlIBkZVUMnVI72jpGIwOmCnA6VlgOlb/9aqdZqqMoGVbVSVb//32RX6YK5GmyyOkAQAMooYcQLRzIyMjR7kZGRkrEZGjr/+5JkQI/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAAQRkZGT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"
	);
	snd.play();
}