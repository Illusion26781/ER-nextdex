function feedPanelMoves(moveID){
    const move = gameData.moves[moveID]
    $('#moves-name').text(move.name)
    $('#moves-pwr').text(move.pwr || "--")
    $('#moves-acc').text(move.acc)
    $('#moves-chance').text('CHANCE: ' + move.chance)
    $('#moves-pp').text(move.pp)
    $('#moves-prio').text(move.prio)
    $('#moves-target').text('' + gameData.targetT[move.target])
    $('#moves-split').text('' + gameData.splitT[move.split])
    $('#moves-types').text('' + move.types.map((x)=>gameData.typeT[x]).join(' '))
    $('#moves-desc').text('' + move.lDesc)
    $('#moves-flags').text('' + move.flags.map((x)=>gameData.flagsT[x]).join(' '))

    $('#moves-list').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
    $('#moves-list').children().eq(moveID - 1).addClass("sel-active").removeClass("sel-n-active")
}

function updateMoves(search){
    const moves = gameData.moves
    const nodeList = $('#moves-list').children()
    let validID;
    for (const i in moves){
        if (i == 0 ) continue
        const move = moves[i]
        const node = nodeList.eq(i - 1)
        if (move.name.toLowerCase().indexOf(search) >= 0 ? true : false)
        {
                if (!validID) validID = i
                node.show()
        } else {
                node.hide()
        }
    }
    feedPanelMoves(validID || 1) //1 ??
}