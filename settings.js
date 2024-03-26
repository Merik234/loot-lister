'use strict';

const DefaultSettings = {
  "enable": true,
	"items": {
	}
  
};

function MigrateSettings(from_ver, to_ver, settings) {
  if (from_ver === undefined) {
    return Object.assign(Object.assign({}, DefaultSettings), settings);
  }
  else if (from_ver === null) {
    return DefaultSettings;
  }
  else {
    if (from_ver + 1 < to_ver) {
      settings = MigrateSettings(from_ver, from_ver + 1, settings);
      return MigrateSettings(from_ver + 1, to_ver, settings);
    }
	/*
    switch (to_ver) {
      case 2:
        settings.channels[] = "Team";
        settings.channels[] = "Raid";
        settings.channels[] = "Raid Leader";
        settings.channels[] = "Raid Notice";
        settings.channels["Team"] = ;
        settings.channels["Raid"] = ;
        settings.channels["Raid Leader"] = ;
        settings.channels["Raid Notice"] = ;
        break;
    }
	*/

    return settings;
  }
}

module.exports = MigrateSettings;