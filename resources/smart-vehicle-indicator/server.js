onNet("skyen:smartindicator.off", (vehicle) => {
    emitNet("skyen:smartindicator.off", -1, vehicle);
});
onNet("skyen:smartindicator.toggle", (turn, vehicle) => {
    emitNet("skyen:smartindicator.toggle", -1, turn, vehicle);
});