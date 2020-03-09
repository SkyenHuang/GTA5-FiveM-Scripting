onNet(
    "skyen:emc.muted",
    (vehicle) => {
        console.info("emit skyen:emc.muted")
        emitNet("skyen:emc.muted", -1, vehicle);
    }
);
