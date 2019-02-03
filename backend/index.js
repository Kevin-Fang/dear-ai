var app = require('express')()
var cors = require('cors')
var bodyParser = require('body-parser')
var request = require("request");
var fs = require('fs')
var authKey = require('./authorization_key.json').key

var SpotifyWebApi = require('spotify-web-api-node')
var meditations = require('./meditations.json')
var sadVideos = require('./sadPlaylists.json')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

tones = ["anger", "fear", "joy", "sadness", "analytical", "confident", "tentative"]

let cache = {
}

let userResults = []

saveData = () => {
	fs.writeFile('./data.json', JSON.stringify(cache), (err) => {
		if (err) {
			console.error("Failed to save cache")
		}
	})
	fs.writeFile('./userResults.json', JSON.stringify(userResults), (err) => {
		if (err) {
			console.error("Failed to save log")
		}
	})
}

loadData = (callback) => {
	try {
		cache = JSON.parse(fs.readFileSync('./data.json', 'utf8'))
		userResults = JSON.parse(fs.readFileSync('./userResults.json', 'utf8'))
	} catch (e) {
		let cache = {}
		let userResults = []
	}
	callback()
}

let cacheRequest = (message, response) => {
	cache[message] = response
	saveData()
}

var spotifyApi = new SpotifyWebApi({
  clientId: '1cb9d9d9a4b14c6780d7be13281bc5f0',
  clientSecret: '81659e1524d54d2ba207f0ef9bf09dae',
  redirectUri: 'http://localhost:8888/callback'
});


let getFromSpotify = (playlist) => {
	spotifyApi.getPlaylist(playlist).then(data => {
		console.log('Some information about this playlist', data.body.tracks.items);
	}, err => {
		console.log('Something went wrong!', err);
	});

}
spotifyApi.setAccessToken('BQAHKmMqccA2xBtZ2eYu5NIpok0eoruEsV7UfQuu-nIickHWlBS7ssAXjk6DrGUUf0yW8rBTvY7xwRvD92RJiwB-RbYuT53eCHVrAsA0_lTyFCXBJmzthiUN743tSuEmu-Vp_RCFaZsNDmJhxfWfs6URiVXaNt5G');


let sampleFromList = (list) => {
	return list[Math.floor(Math.random() * Math.floor(list.length))]
}

let getSad = () => {
	// funny YT video playlists, comfort food, sad music

	let sadResultsObject = {
		videos: sampleFromList(sadVideos),
		restaurants: [],
		music: sadMusicPlaylist
	}
}

let getHappy = () => {
	// amusement parks, restaurants (celebration), funny movies, meditation
}

let getAnger = () => {
	// gyms/spas/saunas, meditation, relaxing music
}

let getFear = () => {
	// meditation, fearless youtube videos, hype music
}

// takes in a message and saves date and returned response (like happiness, sadness)
let saveResults = (message, returnedEmotion) => {
 	userResults.push({
 		date: new Date().toString(),
 		message: message,
 		response: returnedEmotion
 	})
}

let processRequest = (responseObject, res) => {
	let responseTones = responseObject['sentences_tone']

	tonesValues = {
		"sadness": 0,
		"anger": 0,
		"fear": 0,
		"joy": 0,
		"tentative": 0,
		"analytical": 0,
		"confident": 0
	}

	if (responseObject['sentences_tone'] == undefined) {
        responseTones = responseObject['document_tone'].tones
        responseTones.forEach(tone => {
            tonesValues[tone['tone_id']] += tone['score']
        })
    } else {
        responseTones = responseObject['sentences_tone']

        console.log("RESPONSE TONES", responseTones)

        responseTones.forEach(tonesObj => {
            tonesObj.tones.forEach(tone => {
                console.log(JSON.stringify(tone))
                tonesValues[tone['tone_id']] += tone['score']
            })
        })
    }
    let numSentences = responseTones.length

    console.log(JSON.stringify(tonesValues))
    returnsObj = {}
    returnsObj['sadness'] = tonesValues['sadness'] / numSentences
    returnsObj['anger'] = tonesValues['anger'] / numSentences
    returnsObj['fear'] = tonesValues['fear'] / numSentences
    returnsObj['joy'] = tonesValues['joy'] / numSentences
	
	res.send(JSON.stringify(returnsObj))
}

let sampleData = [
  {
    date: "1/23/2019",
    message: "Felt great today. 10/10",
    response: "joy"
  },
  {
    date: "1/28/2019",
    message: "Did not feel so good today",
    response: "sadness"
  },
  {
    date: "2/1/2019",
    message: "Hate my car because it's too slow.",
    response: "anger"
  },
  {
    date: "2/2/2019",
    message: "Went to PennApps today. Was happy to start!",
    response: "joy"
  },
  {
    date: "2/3/2019",
    message: "Have to present tomorrow. Very scared of how it's going to go...",
    response: "fear"
  },
  {
    date: "2/4/2019",
    message: "Happy that we did very well for our presentation at PennApps!",
    response: "joy"
  }
]

app.get("/log", (req, res) => {
	res.setHeader('Content-Type', 'text/json')
	res.send(JSON.stringify(sampleData))
})

app.post("/sentiment", (req, res) => {
	res.setHeader('Content-Type', 'text/json')
	
	let textBody = req.body.sentence

	if (cache[textBody] !== undefined) {
		console.log("Loading results from cache:", textBody, cache[textBody])
		processRequest(cache[textBody], res)
	} else {
		console.log("Received request for sentence: ", textBody)
		let options = {
			method: "POST",
			url: "https://gateway-wdc.watsonplatform.net/tone-analyzer/api/v3/tone",
			headers: {
				Authorization: authKey		
			},
			qs: { 
				version: "2017-09-21" 
			},
			body: textBody
		}

		request(options, (err, respons, body) => {
			if (err) {
				throw new Error(err)
			}
			console.log(body)
			let responseObject = JSON.parse(body)

			cacheRequest(textBody, responseObject)

			processRequest(responseObject, res)
		})
	}
})

loadData(() => {
	let port = 8080
	app.listen(port)
	console.log("Server listening on port", port)
})
