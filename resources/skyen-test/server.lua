RegisterNetEvent("skyen:savePedData")

AddEventHandler("skyen:savePedData", function(player,data)
    print(GetNumPlayerIdentifiers(player))
    for i = 0, GetNumPlayerIdentifiers(player)-1 do
        print(GetPlayerIdentifier(player,i))
    end
    print(player)
    print(data)
    local _player = player
    local _data = data
    MySQL.ready(function ()
        print("mysql ready")
        local result = MySQL.Sync.fetchAll('SELECT * FROM t_player_ped_data where player_id=@player_id', {['@player_id'] = 10, ['@name'] = 'foo'})
        print(json.encode(result))
        print(tonumber(_player))
        TriggerClientEvent('skyen:savePedData.callback', _player, {json.encode(result)})
    end)
end)