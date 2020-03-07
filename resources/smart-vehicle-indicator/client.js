/**
 * @author TinJan <tinjan_wong.cfx.re@outlook.com>
 */
let lastStraightMoment = 0;
let lastTurnLeftMoment = 0;
let lastTurnRightMoment = 0;
const __indicatorThreshold = 2000


setInterval(function () {
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(ped, false);
    if (isDriving(ped, vehicle)) {
        let angle = GetVehicleWheelSteeringAngle(vehicle, 0);

        if (0.2 < angle && angle < 1) {
            if (lastTurnLeftMoment - lastStraightMoment > 500 || lastTurnLeftMoment - lastTurnRightMoment > 1000) {
                toggleIndicatorLights(1, vehicle);
                emitNet("skyen:smartindicator.toggle", 1, NetworkGetNetworkIdFromEntity(vehicle));
            }
            lastTurnLeftMoment = Date.now();
        } else if (-0.15 > angle && angle > -1) {
            if (lastTurnRightMoment - lastStraightMoment > 500 || lastTurnRightMoment - lastTurnLeftMoment > 1000) {
                toggleIndicatorLights(0, vehicle);
                emitNet("skyen:smartindicator.toggle", 0, NetworkGetNetworkIdFromEntity(vehicle));
            }
            lastTurnRightMoment = Date.now();
        } else {
            if (lastStraightMoment - lastTurnRightMoment > __indicatorThreshold && lastStraightMoment - lastTurnLeftMoment > __indicatorThreshold) {
                offIndicatorLights(vehicle);
                emitNet("skyen:smartindicator.off", NetworkGetNetworkIdFromEntity(vehicle), 1)
            }
            lastStraightMoment = Date.now();
        }
    }
}, 100);

// setInterval(function () {
//     let ped = PlayerPedId();
//     let vehicle = GetVehiclePedIsIn(ped, false);
//     if (!isDriving(ped, vehicle)) {
//         return;
//     }
//     if (IsVehicleStopped(vehicle)) {
//         let stopPoint = GetEntityCoords(vehicle);
//         console.info("vehicle stopPoint " + stopPoint);
//         if (IsPointOnRoad(stopPoint[0], stopPoint[1], stopPoint[2]) && !IsVehicleStoppedAtTrafficLights(vehicle)) {
//             turnOnEmergencyFlashers(vehicle);
//         }
//     }

// }, 1000);

function isDriving(ped, vehicle) {
    return vehicle != 0 && GetPedInVehicleSeat(vehicle, -1) === ped;
}

function toggleIndicatorLights(turn, vehicle) {

    // //status none 0 left 1 right 2 both 3
    let status = GetVehicleIndicatorLights(vehicle);
    console.debug(("Indicator status " + status + " turn " + turn) + (turn === 0 ? " left" : " right"));
    // //turn left 1 right 0
    SetVehicleIndicatorLights(vehicle, 1 - turn, false);
    SetVehicleIndicatorLights(vehicle, turn, true);

}

function offIndicatorLights(vehicle) {
    let status = GetVehicleIndicatorLights(vehicle);
    if (status === 0 || status === 3) {
        return;
    }
    SetVehicleIndicatorLights(vehicle, 0, false);
    SetVehicleIndicatorLights(vehicle, 1, false);
}

function turnOnEmergencyFlashers(vehicle) {
    SetVehicleIndicatorLights(vehicle, 0, true);
    SetVehicleIndicatorLights(vehicle, 1, true);
}
function turnOffEmergencyFlashers(vehicle) {
    SetVehicleIndicatorLights(vehicle, 0, false);
    SetVehicleIndicatorLights(vehicle, 1, false);
}

function toggleEmergencyFlashers(vehicle) {
    if (GetVehicleIndicatorLights(vehicle) == 3) {
        turnOffEmergencyFlashers(vehicle);
    } else {
        turnOnEmergencyFlashers(vehicle);
    }
}

onNet("skyen:smartindicator.off", (vehicle) => {
    if (source != PlayerId()) {
        offIndicatorLights(NetworkGetEntityFromNetworkId(vehicle));
    }
});

onNet("skyen:smartindicator.toggle", (turn, vehicle) => {
    if (source != PlayerId()) {
        toggleIndicatorLights(turn, NetworkGetEntityFromNetworkId(vehicle));
    }
});