'use strict';

module.exports = function LootLister(mod) {
		
	// command
	mod.command.add("ll", {
		$none() {
			mod.settings.enabled = !mod.settings.enabled;
			send(`${mod.settings.enabled ? 'en' : 'dis'}abled`);
		},
		track(item_id) {
			if (item_id === undefined) {
				send(`write an item ID`);
				return;
			}
			mod.settings.items[item_id] = {tracked: true};
			send(`tracking ${item_id}: ${getName(item_id)}`);
		},
		ignore(item_id) {
			if (item_id === undefined) {
				send(`write an item ID`);
				return;
			}
			mod.settings.items[item_id] = {tracked: false};
			send(`ignoring ${item_id}: ${getName(item_id)}`);
		}
	});
	
	//Testing stuff
	d.hook('S_BOARD_ITEM_LIST', 1, (event) => {
		d.command.message("S_BOARD_ITEM_LIST");
		d.log("S_BOARD_ITEM_LIST");
		d.log(event);	
	})
	d.hook('S_ENABLE_DISABLE_SELLABLE_ITEM_LIST', 2, (event) => {
		d.command.message("S_ENABLE_DISABLE_SELLABLE_ITEM_LIST");
		d.log("S_ENABLE_DISABLE_SELLABLE_ITEM_LIST");
		d.log(event);
	})
	d.hook('S_RIGHT_ITEM_LIST', 1, (event) => {
		d.command.message("S_RIGHT_ITEM_LIST");
		d.log("S_RIGHT_ITEM_LIST");
		d.log(event);
	})
	
	//Array for just dropped items
	let dropped = [];
	//to make certain the tracked items are only printed once
	let first = true;
	
	d.hook('S_SPAWN_DROPITEM', 9, (event) => {
		//ignore if set to ignore
		if (items[id] !== undefined)
			if (items[id].tracked === false)
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
		dropped.sort(function(a, b){return a.id - b.id}).forEach(drop => { sendMessage('Dropped: ' + drop.id + ' - ' + getName(drop.id) + ' (' + drop.amount + ') ' + drop.stacks + 'x') });
		//Empty dropped Array for next batch of loot
		dropped = [];
		//Allow the d.hook to call this function again
		first = true;
	}
	function delay(milliseconds){
		return new Promise(resolve => {
			setTimeout(resolve, milliseconds);
		});
	}
	function getName(id) {
		d.queryData("/StrSheet_Item/String@id=?/", [id]).then(res => {
			if (res !== null)
				return res;
			else
				return "       ";
		});
	}
	//print message template
	function sendMessage(msg) {
		d.command.message(msg)
	}
}
