
/**
 * parse a .dec format string into an array of cards
 */
function parse(dec)
{
	var deck = dec.split(/\r?\n/);
	var cards = []
	for (var i in deck)
	{
		var line = deck[i].trim()
		var c = {}
		var buf = line.split("|");
		if (buf.length >= 1)
			c.name = buf[0].trim()
		if (buf.length >= 2)
			c.set = buf[1].trim()
		if (buf.length == 3)
			c.no = parseInt(buf[2].trim())

		c.count = 1
		if (c.name.search(" ") > -1)
		{
			buf = parseInt(c.name.slice(0,c.name.search(" ")).trim())
			if (!isNaN(buf) && buf > 0)
			{
				c.count = buf;
				c.name = c.name.slice(c.name.search(" ")).trim()
			}
		}

		cards.push(c)
	}
	return cards
}



/**
 * asks scryfall for teh kards
 */
function scry(cards)
{
	var result = []
	for (var i in cards)
	{
		var c = cards[i]
		var cardResult = {}
		cardResult.name = c.name
		cardResult.count = c.count
		if (c.no)
		{
			var req = new XMLHttpRequest()
			console.log(c)
			req.open("GET", "https://api.scryfall.com/cards/"+c.set+"/"+c.no, false)
			req.onreadystatechange = function()
			{
				if (this.readyState != 4 ||  this.status != 200)
					return
				if (req.response == "")
				{ }
				else
				{
					var resp  = JSON.parse(req.response)
					// TODO handle manage double-faced cards
					cardResult.alternatives=[ buildCuratedCard(resp) ] 
				}
			}
			req.send()

		}
		else
		{
		var req = new XMLHttpRequest()
		req.open("GET", "https://api.scryfall.com/cards/named/?fuzzy="+c.name.replace(" ", "+"), false)
		req.onreadystatechange = function()
		{
			if (this.readyState != 4 ||  this.status != 200)
				return
			//console.log(req.response.toString())
			if (req.response == "")
			{ }
			else
			{
				var resp  = JSON.parse(req.response)
				// TODO untangle this later
				var nreq = new XMLHttpRequest()
				nreq.open("GET", resp.prints_search_uri, false)
				nreq.onreadystatechange = function()
				{
					if (this.readyState != 4 || this.status != 200)
						return
					if (req.response == "")
					{ }
					else
					{
						var nresp = JSON.parse(nreq.response)
						var alternates = []
						for (var d in nresp.data)
						{
							alternates.push(buildCuratedCard(nresp.data[d]))
						}
						//console.log(alternates)
						cardResult.alternatives = alternates

					}
				}

				nreq.send()
			}
		}
		req.send()

		}
		result.push(cardResult)
	}

	return result
}

/*
 * returns a cut down object with only a few fields from a big scryfall object
 */
function buildCuratedCard(sfData)
{
	var r = {}
	r.set = sfData.set
	r.set_name = sfData.set_name
	r.no = sfData.collector_number
	r.artist = sfData.artist
	if (sfData.image_uris)
		r.url = sfData.image_uris.small
	else
	{
		r.url = sfData.card_faces[0].image_uris.small
		r.url_back = sfData.card_faces[1].image_uris.small
	}
	return r
}
