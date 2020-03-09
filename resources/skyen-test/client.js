


RegisterCommand("skyen.gametag", function () {
    for (let index = 0; index < 255; index++) {
        RemoveMpGamerTag(index);
        if (index != PlayerId() && NetworkIsPlayerActive(index)) {
            let playerServerId = GetPlayerServerId(index);
            let playerName = GetPlayerName(index);
            let gameTag = CreateMpGamerTagForNetPlayer(index, playerName + "(" + playerServerId + ")", false, false, 0, 255, 255, 255)
            console.info("setting gamertag " + gameTag + " " + playerServerId + " " + playerName);
            SetMpGamerTagVisibility(gameTag, 0, true);
        }
    }

}, false);

RegisterCommand("->", function (source, args) {
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(
        ped,
        false
    );
    if (vehicle != 0 && GetPedInVehicleSeat(vehicle, -1) === ped) {
        console.info("left light");
        toggleIndicatorLights(0, vehicle);
    }

}, false);

RegisterCommand("<-", function (source, args) {
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(
        ped,
        false
    );
    if (vehicle != 0 && GetPedInVehicleSeat(vehicle, -1) === ped) {
        console.info("right light");
        toggleIndicatorLights(1, vehicle);
    }
}, false);

RegisterCommand("skyen.vehicle.into", function (source, args) {

    let player = PlayerPedId();
    let pos = GetEntityCoords(player);
    let seat = Number.parseInt(args[0]);
    let closestVehicle = GetClosestVehicle(pos[0], pos[1], pos[2], 10, 0, 7);

    TaskEnterVehicle(
        player,
        closestVehicle,
        5000,
        seat,
        1.0,
        1,
        0
    );
    emit('chat:addMessage', {
        args: [
            "into vehicle flag",
            args
        ]
    })
}, false);



RegisterCommand("skyen.vehicle", function (source, args) {
    let vehicleName = args[0];

    if (IsModelInCdimage(vehicleName) && IsModelAVehicle(vehicleName)) {
        RequestModel(vehicleName);
        setTimeout(function () {
            if (HasModelLoaded(vehicleName)) {
                let playerPedId = PlayerPedId();
                let pos = GetEntityCoords(playerPedId);
                let vehicle = CreateVehicle(vehicleName, pos[0], pos[1], pos[2], GetEntityHeading(playerPedId), true, false);
                SetPedIntoVehicle(playerPedId, vehicle, -1);
                SetEntityAsNoLongerNeeded(vehicle);
                SetModelAsNoLongerNeeded(vehicleName);
            }

            emit('chat:addMessage', {
                args: [
                    'Vehicle sqawned!'
                ]
            })
        }, 5000);
    }
}, false);

RegisterCommand("skyen.vehicle.fix", function (source, args) {
    let vehicle = GetVehiclePedIsIn(
        PlayerPedId(),
        false
    );

    SetVehicleBodyHealth(
        vehicle,
        1000
    );

    SetVehicleEngineHealth(
        vehicle,
        1000
    );

    SetVehicleFixed(
        vehicle
    );
}, false);

RegisterCommand("skyen.ped.closest", function (source, args) {
    let ped = PlayerPedId();
    let result = GetPedNearbyPeds(ped, 28);
    emit('chat:addMessage', {
        args: [
            result,
        ]
    });
    let coords = GetEntityCoords(ped);
    result = GetClosestPed(
        coords[0],
        coords[1],
        coords[2],
        50,
        1,
        0,
        0,
        0,
        -1
    );
    emit('chat:addMessage', {
        args: [
            result,
        ]
    });
}, false);

RegisterCommand("skyen.ped.test", function (source, args) {

    let ped = PlayerPedId();
    let coords = GetEntityCoords(ped);
    let result = GetClosestPed(
        coords[0],
        coords[1],
        coords[2],
        50,
        1,
        0,
        0,
        0,
        -1
    );
    let targetPed = -1;
    if (result[0]) {
        targetPed = result[1];
        makePedStopAndHandsup(targetPed, function (whoHandsup) {

            loadAnimDict("anim@gangops@morgue@table@", function (animDictName) {
                AttachEntityToEntity(ped, whoHandsup, GetEntityBoneIndexByName(whoHandsup, "BONETAG_SPINE"), 0.75, 0, 0, 0.0, 0.0, 67.0, false, false, false, true, 0, false);
                TaskPlayAnim(ped, animDictName, "player_search", 8.0, -8, 5000, 33, 0, 0, 0, 0);
                console.info("search ped");
                setTimeout(function () {
                    StopAnimTask(ped, animDictName, "player_search", 1.0);
                    ClearPedTasksImmediately(ped);
                    ClearPedSecondaryTask(ped);
                    DetachEntity(ped, false, false);

                    StopAnimTask(whoHandsup, "random@mugging3", "handsup_standing_base", 1.0);
                    console.info("finish search ped");
                }, 5000)
            })
        });
    }

}, false);


// Emergency Flashers
RegisterCommand("skyen.vehicle.emcfls", function (source, args) {
    let vehicle = GetVehiclePedIsIn(PlayerPedId(), true);
    console.info("vehicle " + vehicle + " emcfls")
    let status = GetVehicleIndicatorLights(
        vehicle
    );
    console.info("vehicle Indicator status " + status)
    let toggle = true;
    if (status === 3) {
        toggle = false;
    }

    console.info("toggle " + toggle);
    SetVehicleIndicatorLights(vehicle, 0, toggle);
    SetVehicleIndicatorLights(vehicle, 1, toggle);
    setTimeout(function () {
        if (GetVehiclePedIsIn(PlayerPedId(), false) == 0) {
            SetVehicleEngineOn(
                vehicle,
                false,
                true,
                false
            );
        }
        SetVehicleIndicatorLights(vehicle, 0, false);
        SetVehicleIndicatorLights(vehicle, 1, false);
    }, 1000);
}, false);

RegisterCommand("skyen.vehicle.lock", function (source, args) {
    let vehicle = GetVehiclePedIsIn(PlayerPedId(), true);
    console.info("set vehicle " + vehicle + " lock " + args[0])
    let soundTimes = 0;

    SetVehicleLights(vehicle, 2);
    // SetVehicleEngineOn(vehicle, true, true, false);
    let soundInterval = setInterval(() => {
        if (++soundTimes > 2) {
            clearInterval(soundInterval);
            OverrideVehHorn(vehicle, false, 0);
            return;
        }
        OverrideVehHorn(vehicle, true, GetVehicleDefaultHornIgnoreMods(vehicle));
        SoundVehicleHornThisFrame(vehicle);
    }, 600);
    SetVehicleIndicatorLights(vehicle, 0, true);
    SetVehicleIndicatorLights(vehicle, 1, true);
    setTimeout(function () {
        SetVehicleIndicatorLights(vehicle, 0, false);
        SetVehicleIndicatorLights(vehicle, 1, false);
        // SetVehicleEngineOn(vehicle, false, true, false);
        SetVehicleLights(vehicle, 0);
    }, 1500);
    SetVehicleDoorsLocked(vehicle, Number.parseInt(args[0]));

}, false);

RegisterCommand("skyen.emc.muted.", function () {
    let vehicle = GetVehiclePedIsIn(PlayerPedId(), false);
    SetVehicleHasMutedSirens(vehicle, true);
    emitNet("skyen:emc.muted", NetworkGetNetworkIdFromEntity(vehicle));
}, false)

RegisterCommand("skyen.ui", function (source, args) {
    SendNuiMessage(JSON.stringify({
        type: args[0]
    }))
}, false);


RegisterCommand("skyen.nearby", function () {
    let peds = GetPedNearbyPeds(PlayerPedId())
    let vehicles = GetPedNearbyVehicles(PlayerPedId())
    console.info(JSON.stringify(peds));
    console.info(JSON.stringify(vehicles));
}, false);

function makePedStopAndHandsup(ped, afterThat) {

    loadAnimDict("random@mugging3", function (animDictName) {
        TaskSetBlockingOfNonTemporaryEvents(ped, true);
        ClearPedTasksImmediately(ped);
        TaskPlayAnim(ped, animDictName, "handsup_standing_base", 8.0, -8, 0.01, 1, 0, 0, 0, 0);
        console.info("ped hands up");
        if (typeof (afterThat) === "function") {
            afterThat(ped);
            console.info("do after ped hands up");
        }
    });
}



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

onNet("skyen:emc.muted", (vehicle) => {

    console.info("fire skyen.emc.muted param " + vehicle);
    SetVehicleHasMutedSirens(NetworkGetEntityFromNetworkId(vehicle), true);
});