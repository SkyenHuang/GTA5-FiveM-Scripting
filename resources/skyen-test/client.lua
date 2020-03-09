local mpGamerTags = {}

for i = 0, 255 do
  if NetworkIsPlayerActive(i) then
    local ped = GetPlayerPed(i)

    -- change the ped, because changing player models may recreate the ped
    if not mpGamerTags[i] or mpGamerTags[i].ped ~= ped then
      local nameTag = ('%s [%d]'):format(GetPlayerName(i), GetPlayerServerId(i))

      if mpGamerTags[i] then
        RemoveMpGamerTag(mpGamerTags[i].tag)
      end

      mpGamerTags[i] = {
        tag = CreateMpGamerTagForNetPlayer(i, nameTag, false, false, '', 0, 0, 0, 0),
        ped = ped
      }
    end

    SetMpGamerTagVisibility(mpGamerTags[i].tag, 4, NetworkIsPlayerTalking(i))
  elseif mpGamerTags[i] then
    RemoveMpGamerTag(mpGamerTags[i].tag)

    mpGamerTags[i] = nil
  end
end