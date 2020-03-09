import * as Cfx from 'fivem-js';
import * as Native from '@citizenfx/client';
const sha1 = require('js-sha1');
const spawnmanager = exports.spawnmanager;

let lastPedComponentsDataSha1 = sha1("");


RegisterCommand("skyen.anim", function (source, args) {

  loadAnimDict(args[0], function (animDictName) {
    let ped = PlayerPedId();
    ClearPedTasksImmediately(ped);
    ClearPedSecondaryTask(ped);
    TaskPlayAnim(ped, animDictName, args[1], 8.0, 8.0, -1, 0, 0, 0, 0, 0);
  });
}, false)

function loadAnimDict(animDictName, loadedHandler) {
  if (!HasAnimDictLoaded(animDictName)) {
    RequestAnimDict(animDictName);
    let waittingAnimDistLoad = setInterval(function () {
      if (HasAnimDictLoaded(animDictName)) {
        console.info(animDictName + " loaded");
        clearInterval(waittingAnimDistLoad);
        if (typeof (loadedHandler) === "function") {
          loadedHandler(animDictName);
          console.info("do after loaded");
        }
      }
    }, 500);
  } else {
    if (typeof (loadedHandler) === "function") {
      loadedHandler(animDictName);
      console.info(animDictName + "do after loaded");
    }
  }
}

RegisterCommand("skyen.savedata", function () {
  let pedComponentsData = JSON.stringify(getPedComponents(PlayerPedId()));
  let pedComponentsDataSha1 = sha1(pedComponentsData);
  console.info(pedComponentsData + " " + pedComponentsDataSha1);
  if (lastPedComponentsDataSha1 != pedComponentsDataSha1 || true) {
    console.info("emit savePedData");
    emitNet("skyen:savePedData", GetPlayerServerId(PlayerId()), pedComponentsData);
    lastPedComponentsDataSha1 = pedComponentsDataSha1;
  }
}, false);

onNet("skyen:savePedData.callback", (result) => {
  console.info(result);
});

RegisterCommand("skyen.weapon", function (source, args) {
  giveAllWeapon(PlayerPedId());
}, false);

RegisterCommand("skyen.vehicle.extra", function (source, args) {
  let extraId = Number.parseInt(args[0])
  SetVehicleExtra(
    GetVehiclePedIsIn(PlayerPedId(), true),
    extraId >= 0 ? extraId : 0,
    1,
  );
}, false)


const copComponentVariations = [
  {
    "id": "1",
    "drawable": "0",
    "texture": "0"
  },
  {
    "id": "3",
    "drawable": "0",
    "texture": "0"
  },
  {
    "id": "4",
    "drawable": "35",
    "texture": "0"
  },
  {
    "id": "5",
    "drawable": "0",
    "texture": "0"
  },
  {
    "id": "6",
    "drawable": "25",
    "texture": "0"
  },
  {
    "id": "7",
    "drawable": "0",
    "texture": "0"
  },
  {
    "id": "8",
    "drawable": "58",
    "texture": "0"
  },
  {
    "id": "9",
    "drawable": "0",
    "texture": "0"
  },
  {
    "id": "10",
    "drawable": "8",
    "texture": "1"
  },
  {
    "id": "11",
    "drawable": "55",
    "texture": "0"
  }
];

const copPropVariations = [
  {
    id: 0,
    drawable: 46,
    texture: 0,
  }, {
    id: 1,
    drawable: 8,
    texture: 0,
  }, {
    id: 6,
    drawable: 3,
    texture: 0,
  }
]
RegisterCommand("skyen.ped.cop", function (source, args) {
  SetPoliceIgnorePlayer(PlayerId(), true);
  SetPedAsCop(PlayerPedId(), true);
  setPedComponents(PlayerPedId(), copComponentVariations, 0)
  setPedProps(PlayerPedId(), copPropVariations);
});

function getPedComponents(ped) {
  let componentIndexArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  let pedComponents = [];
  componentIndexArray.forEach((componentId) => {
    pedComponents.push({
      id: componentId,
      drawable: GetPedDrawableVariation(ped, componentId),
      texture: GetPedTextureVariation(ped, componentId),
    })
  });
  return pedComponents;
}



function setPedComponents(ped, variations, paletteId) {
  variations.forEach(variation => {
    let component = Number.parseInt(variation.id);
    let drawable = Number.parseInt(variation.drawable);
    let texture = Number.parseInt(variation.texture);
    let numberOfDrawable = GetNumberOfPedDrawableVariations(ped, component);
    console.info("drawable " + JSON.stringify(numberOfDrawable));
    let numberOfTexture = GetNumberOfPedTextureVariations(ped, component, drawable - 1);
    console.info("texture " + JSON.stringify(numberOfTexture));
    SetPedComponentVariation(
      ped,
      component >= 0 ? component : 0,
      drawable >= 0 ? drawable : 0,
      texture >= 0 ? texture : 0,
      paletteId >= 0 ? paletteId : 0
    );
    console.info([GetPedDrawableVariation(ped, component), GetPedTextureVariation(ped, component), GetPedPaletteVariation(ped, component)]);
  });

}

function getPedProps(ped) {
  let propIndexArray = [0, 1, 2, 6, 7];
  let pedProps = [];
  propIndexArray.forEach((componentId) => {
    pedProps.push({
      id: componentId,
      drawable: GetPedPropIndex(ped, componentId),
      texture: GetPedPropTextureIndex(ped, componentId),
    })
  });
  return pedProps;
}

function setPedProps(ped, props) {
  props.forEach((prop) => {
    let component = Number.parseInt(prop.id);
    let drawable = Number.parseInt(prop.drawable);
    let texture = Number.parseInt(prop.texture);
    let numberOfDrawable = GetNumberOfPedPropDrawableVariations(ped, component);
    console.info("drawable " + JSON.stringify(numberOfDrawable));
    let numberOfTexture = GetNumberOfPedPropTextureVariations(ped, component, drawable - 1);
    console.info("texture " + JSON.stringify(numberOfTexture));

    SetPedPropIndex(
      ped,
      component >= 0 ? component : 0,
      drawable >= 0 ? drawable : 0,
      texture >= 0 ? texture : 0,
      true
    );
    console.info([GetPedPropIndex(ped, component), GetPedPropTextureIndex(ped, component)]);
  });
}



RegisterCommand("skyen.ped.component", function (source, args) {

  let paletteId = Number.parseInt(args[3]);
  let ped = PlayerPedId();
  setPedComponents(ped, [{
    id: Number.parseInt(args[0]),
    drawable: Number.parseInt(args[1]),
    texture: Number.parseInt(args[2])
  }], paletteId);
}, false);

RegisterCommand("skyen.ped.prop", function (source, args) {
  let ped = PlayerPedId();
  setPedProps(ped, [{
    id: Number.parseInt(args[0]),
    drawable: Number.parseInt(args[1]),
    texture: Number.parseInt(args[2])
  }]);
}, false);

RegisterCommand("skyen.player.model", function (source, args) {

  let model = new Cfx.Model(args[0] ? args[0] : (Math.floor(Math.random() * 2) === 0 ? "mp_m_freemode_01" : "mp_f_freemode_01"));

  RequestModel(model.hash);
  let start = GetGameTimer();
  let loadingModel = setInterval(() => {
    console.info("model requesting");
    if (HasModelLoaded(model.hash) && model.IsPed) {
      clearInterval(loadingModel);
      console.info("setting ped model");
      SetPlayerModel(Cfx.Game.Player.Handle, model.Hash);
      SetPedHeadBlendData(PlayerPedId(), 21, 0, 0, 21, 0, 0, 0.5, 0.5, 0);
      SetModelAsNoLongerNeeded(model.hash);
    } else if (GetGameTimer() - start > 1000) {
      clearInterval(loadingModel);
    }
  }, 100);

}, false);

RegisterCommand(
  'skyen.vehicle',
  async (source, args) => {
    let vehicleName = args[0];
    const playerCoords = Cfx.Game.PlayerPed.Position;
    let pedHeading = Cfx.Game.PlayerPed.Heading;
    let vehicleModel = new Cfx.Model(vehicleName);
    const vehicle = await Cfx.World.createVehicle(vehicleModel, playerCoords, pedHeading);
    Cfx.Game.PlayerPed.setIntoVehicle(vehicle, Cfx.VehicleSeat.Driver);
    vehicleModel.markAsNoLongerNeeded();
  },
  false,
);

RegisterCommand("skyen.ped", async function (source, args) {
  console.info("skyen.ped " + JSON.stringify(source));
  const ped = await Cfx.World.createPed(new Cfx.Model(args[0]), Cfx.Game.PlayerPed.Position);
  SetPedAsCop(ped.Handle, true);
  TaskStartScenarioInPlace(ped, args[1], 0, true);
}, false);


RegisterCommand("skyen.coords", function (source, args) {

  console.info("skyen.coords " + JSON.stringify(Cfx.Game.PlayerPed.Position));

}, false);

on("gameEventTriggered", (name, args) => {
  console.info(`Game event ${name} ${args.join(', ')}`)
});

on('onClientGameTypeStart', () => {
  prepareSpawn(true);
});

on('onClientResourceStart', (name) => {
  if (name === 'skyen-test') {
    prepareSpawn(false);
  }
});

function prepareSpawn(forceRespawn) {
  spawnmanager.setAutoSpawnCallback(() => {
    preparePlayerPed();
  });
  spawnmanager.setAutoSpawn(true);
  if (forceRespawn) {
    spawnmanager.forceRespawn();
  }
}

function preparePlayerPed() {
  let initCoords = {
    x: 53.634,
    y: -755.146,
    z: 43.724
  }
  spawnmanager.spawnPlayer({
    x: initCoords.x,
    y: initCoords.y,
    z: initCoords.z,
    model: 's_m_m_fibsec_01'
  }, (spawn) => {
    console.info("spawn player " + JSON.stringify(spawn));
    let playerPedId = PlayerPedId();
    SetPoliceIgnorePlayer(PlayerId(), true);
    SetDispatchCopsForPlayer(PlayerId(), false);
    SetMaxWantedLevel(0);
    giveAllWeapon(playerPedId);
  });

}

const __weapons = [
  "WEAPON_KNIFE",
  "WEAPON_NIGHTSTICK",
  "WEAPON_HAMMER",
  "WEAPON_BAT",
  "WEAPON_GOLFCLUB",
  "WEAPON_CROWBAR",
  "WEAPON_PISTOL",
  "WEAPON_COMBATPISTOL",
  "WEAPON_APPISTOL",
  "WEAPON_PISTOL50",
  "WEAPON_MICROSMG",
  "WEAPON_SMG",
  "WEAPON_ASSAULTSMG",
  "WEAPON_ASSAULTRIFLE",
  "WEAPON_CARBINERIFLE",
  "WEAPON_ADVANCEDRIFLE",
  "WEAPON_MG",
  "WEAPON_COMBATMG",
  "WEAPON_PUMPSHOTGUN", "WEAPON_SAWNOFFSHOTGUN", "WEAPON_ASSAULTSHOTGUN", "WEAPON_BULLPUPSHOTGUN", "WEAPON_STUNGUN", "WEAPON_SNIPERRIFLE", "WEAPON_HEAVYSNIPER",
  "WEAPON_GRENADELAUNCHER", "WEAPON_GRENADELAUNCHER_SMOKE", "WEAPON_RPG", "WEAPON_MINIGUN", "WEAPON_GRENADE", "WEAPON_STICKYBOMB", "WEAPON_SMOKEGRENADE",
  "WEAPON_BZGAS", "WEAPON_MOLOTOV", "WEAPON_FIREEXTINGUISHER", "WEAPON_PETROLCAN", "WEAPON_FLARE", "WEAPON_SNSPISTOL", "WEAPON_SPECIALCARBINE", "WEAPON_HEAVYPISTOL",
  "WEAPON_BULLPUPRIFLE", "WEAPON_HOMINGLAUNCHER", "WEAPON_PROXMINE", "WEAPON_SNOWBALL", "WEAPON_VINTAGEPISTOL", "WEAPON_DAGGER", "WEAPON_FIREWORK", "WEAPON_MUSKET",
  "WEAPON_MARKSMANRIFLE", "WEAPON_HEAVYSHOTGUN", "WEAPON_GUSENBERG", "WEAPON_HATCHET", "WEAPON_RAILGUN", "WEAPON_COMBATPDW", "WEAPON_KNUCKLE", "WEAPON_MARKSMANPISTOL",
  "WEAPON_FLASHLIGHT", "WEAPON_MACHETE", "WEAPON_MACHINEPISTOL", "WEAPON_SWITCHBLADE", "WEAPON_REVOLVER", "WEAPON_COMPACTRIFLE", "WEAPON_DBSHOTGUN", "WEAPON_FLAREGUN",
  "WEAPON_AUTOSHOTGUN", "WEAPON_BATTLEAXE", "WEAPON_COMPACTLAUNCHER", "WEAPON_MINISMG", "WEAPON_PIPEBOMB", "WEAPON_POOLCUE", "WEAPON_SWEEPER", "WEAPON_WRENCH"

];

function giveAllWeapon(ped) {
  __weapons.forEach((value, index, array) => {
    GiveWeaponToPed(
      ped,
      value,
      9999,
      false,
      false
    );
  });

}