var liskTimestamp;
var unixTimestamp;
var _datetime;
var loadCount = 0;

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

async function submit(net)
{
    document.getElementById("mainnet").style.display = 'none';
    document.getElementById("testnet").style.display = 'none';
    document.getElementById("betanet").style.display = 'none';

    loadCount = 0;
    document.getElementById("loading").innerHTML = "0%";
    document.getElementById("loading").style.width =  "0%";
    document.getElementById("progress").style.display = 'block';
    
    let delegateInfo = [];

    let url = '';
    if(net == 'mainnet')
        url = 'https://main-02.liskapi.io/';
    else if(net == 'testnet')
        url = 'https://testnet.lisk.io/';
    else if(net == 'betanet')
        url = 'https://betanet.lisk.io/';

    await fetch(url + "api/delegates?limit=101")
    .then(res => res.json())
    .then(async (delegates) => {
        loadCount++;
        document.getElementById("loading").innerHTML = (loadCount / 102 * 100).toFixed(0) + "%";
        document.getElementById("loading").style.width = (loadCount / 102 * 100).toFixed(0) + "%";
        for(let i = 0; i < delegates.data.length; i++)
        {
            let delegate = {};
            delegate.username = delegates.data[i].username;
            delegate.publicKey = delegates.data[i].account.publicKey;

            await fetch(url + "api/blocks?limit=1&generatorPublicKey=" + delegate.publicKey)
            .then(res => res.json())
            .then((block) => {
                if(block.data.length > 0)
                {
                    delegate.lastBlockHeight = block.data[0].height;
                    delegate.lastBlockTimestamp = block.data[0].timestamp;
                }
                else
                {
                    delegate.lastBlockHeight = null;
                    delegate.lastBlockTimestamp = null;
                }

                delegateInfo.push(delegate);
                loadCount++;
                document.getElementById("loading").innerHTML = (loadCount / 102 * 100).toFixed(0) + "%";
                document.getElementById("loading").style.width = (loadCount / 102 * 100).toFixed(0) + "%";
            }).catch(function(){
                let delegate = {};
                delegate.username = delegates.data[i].username;
                delegate.lastBlockHeight = 0;
                delegate.lastBlockTimestamp = 0;
                delegateInfo.push(delegate);
                loadCount++;
                document.getElementById("loading").innerHTML = (loadCount / 102 * 100).toFixed(0) + "%";
                document.getElementById("loading").style.width = (loadCount / 102 * 100).toFixed(0) + "%";
            });
        }
    }).catch(function(){
        document.getElementById("progress").style.display = 'none';
        document.getElementById("error").style.display = 'block';
    });

    delegateInfo.sort((a, b) => (a.lastBlockHeight > b.lastBlockHeight) ? 1 : -1)

    document.getElementById("data").innerHTML = "";
    document.getElementById("data").innerHTML += "<label class='col-sm-2 col-form-label'><b>#</b></label><label class='col-sm-3 col-form-label'><b>Delegate</b></label><label class='col-sm-4 col-form-label'><b>Date & Time</b></label><label class='col-sm-3 col-form-label'><b>Height</b></label><br />";

    for(let i = 0; i < delegateInfo.length; i++)
    {
        let unixTimestamp = delegateInfo[i].lastBlockTimestamp + 1464109200;
        let _datetime = new Date(unixTimestamp * 1000);

        // get total seconds between the times
        var delta = Math.abs(Date.now() - _datetime) / 1000;

        // calculate (and subtract) whole days
        var days = Math.floor(delta / 86400);
        delta -= days * 86400;

        // calculate (and subtract) whole hours
        var hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;

        // calculate (and subtract) whole minutes
        var minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;

        // what's left is seconds
        var seconds = Math.round(delta % 60);  // in theory the modulus is not required

        let timeBetween = '';
        if(days > 1)
            timeBetween += days + ' days ';
        else if(days === 1)
            timeBetween += days + ' day ';

        if(hours > 1)
            timeBetween += hours + ' hours ';
        else if(hours === 1)
            timeBetween += hours + ' hour ';

        if(minutes > 1)
            timeBetween += minutes + ' minutes ';
        else if(minutes === 1)
            timeBetween += minutes + ' minute ';

        if(seconds > 1)
            timeBetween += seconds + ' seconds';
        else if(seconds === 1)
            timeBetween += seconds + ' second';

        document.getElementById("data").innerHTML += "<span data-toggle='tooltip' data-placement='top' title='" + timeBetween + "'><label class='col-sm-2 col-form-label'>" + (i + 1) + "</label><label class='col-sm-3 col-form-label'>" + delegateInfo[i].username + "</label><label class='col-sm-4 col-form-label'>" + monthNames[_datetime.getMonth()] + " " + _datetime.getDate() + ", " + _datetime.getFullYear() + " " + formatAMPM(_datetime) + "</label><label class='col-sm-3 col-form-label'>" + delegateInfo[i].lastBlockHeight + "</label></span><br />";
        
    }

    $('[data-toggle="tooltip"]').tooltip();
    document.getElementById("progress").style.display = 'none';
    document.getElementById("data").style.display = 'block';
}

function showdatetime()
{
    document.getElementById("timestamp").style.display = "none";
    document.getElementById("datetime").style.display = "block";
    document.getElementById("timestamplabel").innerHTML = "Date Time:";
}

function convert() {
    if(document.getElementById("radlisk").checked) {
        liskTimestamp = Number(document.getElementById("timestamp").value);
        unixTimestamp = liskTimestamp + 1464109200;
        _datetime = new Date(unixTimestamp * 1000);
    }
    else if(document.getElementById("radunix").checked) {
        unixTimestamp = Number(document.getElementById("timestamp").value);
        liskTimestamp = unixTimestamp - 1464109200;
        _datetime = new Date(unixTimestamp * 1000);
    }
    else {
        _datetime = document.getElementById("datetime").value;
        unixTimestamp = Date.parse(_datetime)/1000; //_datetime.getUnixTime();
        liskTimestamp = unixTimestamp - 1464109200;
        _datetime = new Date(_datetime);
    }

    let minutes;
    if (_datetime.getMinutes() >= 10)
    {
        minutes = _datetime.getMinutes();
    }
    else
    {
        minutes = "0" + _datetime.getMinutes();
    }

    let seconds;
    if (_datetime.getSeconds() >= 10)
    {
        seconds = _datetime.getSeconds();
    }
    else
    {
        seconds = "0" + _datetime.getSeconds();
    }

    //document.getElementById("data").innerHTML = "<label class='col-sm-3 col-form-label'>Lisk Timestamp:</label><label class='col-sm-4 col-form-label'>" + liskTimestamp + "</label><br />" +
    //"<label class='col-sm-3 col-form-label'>Unix Timestamp:</label><label class='col-sm-4 col-form-label'>" + unixTimestamp + "</label><br />" +
    //"<label class='col-sm-3 col-form-label'>Date Time:</label><label class='col-sm-3 col-form-label'>" + monthNames[_datetime.getMonth()] + " " + _datetime.getDate() + ", " + _datetime.getFullYear() + " " + formatAMPM(_datetime) + "</label><br />"
}

function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    //let seconds = date.getSeconds();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    //seconds = seconds < 10 ? '0' + seconds : seconds;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}
