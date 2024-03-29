'use strict';

module.exports = function LootLister(mod) {
		
	// command
	mod.command.add("ll", {
		$none() {
			mod.settings.enabled = !mod.settings.enabled;
			sendMessage(`${mod.settings.enabled ? 'en' : 'dis'}abled`);
		},
		track(item_id) {
			if (item_id === undefined) {
				sendMessage(`write an item ID`);
				return;
			}
			mod.settings.items[item_id] = {tracked: true};
			printTracking(parseInt(item_id), true);
		},
		ignore(item_id) {
			if (item_id === undefined) {
				sendMessage(`write an item ID`);
				return;
			}
			mod.settings.items[item_id] = {tracked: false};
			printTracking(parseInt(item_id), false);
		}
	});
	
	//Testing stuff
	mod.hook('S_BOARD_ITEM_LIST', 1, (event) => {
		mod.command.message("S_BOARD_ITEM_LIST");
		mod.log("S_BOARD_ITEM_LIST");
		mod.log(event);	
	})
	mod.hook('S_RIGHT_ITEM_LIST', 1, (event) => {
		mod.command.message("S_RIGHT_ITEM_LIST");
		mod.log("S_RIGHT_ITEM_LIST");
		mod.log(event);
	})
	
	//Array for just dropped items
	let dropped = [];
	//to make certain the tracked items are only printed once
	let first = true;
	
	mod.hook('S_SPAWN_DROPITEM', 9, (event) => {
		//ignore if set to ignore
		if (mod.settings.items[event.item] !== undefined)
			if (mod.settings.items[event.item].tracked === false)
				return;
		
		//if not in dropped Array, add to Array
		if (dropped.find(drop => ((drop.id === event.item) && (drop.amount === event.amount)) ) === undefined)
			dropped[dropped.length] = {id:event.item, amount:event.amount, stacks:1};
		//if in dropped Array, increase stacks dropped by 1
		else
			dropped.find(drop => (drop.id === event.item)).stacks += 1;
			
		//if this is the first dropped item, start printing output
		if (first && dropped.length != 0) {
			first = false;
			output();
		}
	})
	
	//print into toolbox chat
	async function output() {
		//wait a moment to finish adding items to the dropped Array
		await delay(100);
		//print all dropped items we tracked, like this:
		//Dropped: <id> - <name> (<amount>) <stacks>x
		//Dropped: 1 - Cookie (3) 5x
		dropped.sort(function(a, b){return a.id - b.id}).forEach(drop => { printLoot(drop) });
		//Empty dropped Array for next batch of loot
		dropped = [];
		//Allow the mod.hook to call this function again
		first = true;
	}
	function delay(milliseconds){
		return new Promise(resolve => {
			setTimeout(resolve, milliseconds);
		});
	}
	function printLoot(drop) {
		mod.queryData("/StrSheet_Item/String@id=?/", [drop.id]).then(res => {
			if (res !== null) {
				sendMessage(`Dropped: ${drop.id} - ${res.attributes.string} (${drop.amount}) ${drop.stacks}x`);
			}
			else
				sendMessage(`Dropped: ${drop.id} -         (${drop.amount}) ${drop.stacks}x`);
		});
	}
	function printTracking(id, tracking) {
		sendMessage("alive");
		mod.queryData("/StrSheet_Item/String@id=?/", [id]).then(res => {
			sendMessage("alive");
			if (res !== null) {
				sendMessage(`${tracking ? "tracking" : "ignoring"} ${id}: ${res.attributes.string}`);
			}
			else
				sendMessage(`${tracking ? "tracking" : "ignoring"} ${id}: UNKNOWN ITEM`);
		});
	}
	//print message template
	function sendMessage(msg) {
		mod.command.message(msg)
	}
}
