import { getSpritesURL, redirectSpecie, getSpritesShinyURL } from "./species/species_panel.js"
import { queryFilter2, queryFilter3 } from "../filters.js"
import { gameData } from "../data_version.js"
import { AisInB, e, JSHAC } from "../utils.js"
import { setFullTeam } from "./team_builder.js"
import { getGEN3HP } from "../load_save.js"

const trainerParam = {
    elite: false
}

let currentTrainerID = 0
export function feedPanelTrainers(trainerID) {
    currentTrainerID = trainerID
    $('#trainers-list').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
    $('#trainers-list > .btn').eq(trainerID).addClass("sel-active").removeClass("sel-n-active")
    const trainer = gameData.trainers[trainerID]
    $('#trainers-name').text(trainer.fullName)
    $('#trainers-map').text(gameData.mapsT[trainer.map] || "Unknown location")
    setBaseTrainer(trainer)
    setRematchesBar(trainer.rem)
    setInsane(trainer)
    setPartyPanel(trainer.party)

}

function setDouble(double) {
    if (double) {
        $('#trainers-double').show()
    } else {
        $('#trainers-double').hide()
    }
}

function setBaseTrainer(trainer) {
    const party = trainer.party
    if (!party || party.length < 1) {
        $('#trainers-normal').empty()
        return
    }
    const nodeNormal = e('div')
    nodeNormal.innerText = "Normal"
    nodeNormal.className = "trainer-match-btn sel-active"
    nodeNormal.onclick = () => {
        trainerParam.elite = false
        setPartyPanel(party)
        $('#trainers-infobar').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
        nodeNormal.className = "trainer-match-btn sel-active"
    }
    $('#trainers-normal').empty().append(nodeNormal)
    setDouble(trainer.db)
}

function setInsane(trainer) {
    const insaneTeam = trainer.insane
    if (!insaneTeam || insaneTeam.length < 1) {
        $('#trainers-elite').empty()
        return
    }
    const nodeElite = e('div')
    nodeElite.innerText = "Elite"
    nodeElite.className = "trainer-match-btn sel-n-active"
    nodeElite.onclick = () => {
        trainerParam.elite = true
        setPartyPanel(insaneTeam)
        $('#trainers-infobar').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
        nodeElite.className = "trainer-match-btn sel-active"
    }
    $('#trainers-elite').empty().append(nodeElite)
    setDouble(trainer.db)
    if (trainerParam.elite) {
        nodeElite.onclick()
    }
}

function setRematchesBar(rematches) {
    if (rematches.length < 1) {
        return $('#trainers-rematch').empty()
    }
    const frag = document.createDocumentFragment()
    const spanInfo = e('span')
    spanInfo.innerText = "Rematches :"
    frag.append(spanInfo)
    for (const remI in rematches) {
        const rem = rematches[remI]
        const nodeRem = e('div')
        nodeRem.innerText = +remI + 1
        nodeRem.className = "trainer-match-btn sel-n-active"
        nodeRem.onclick = () => {
            setPartyPanel(rem.party)
            $('#trainers-infobar').find('.sel-active').addClass("sel-n-active").removeClass("sel-active")
            $('#trainers-rematch').children().eq(+remI + 1).addClass("sel-active").removeClass("sel-n-active")
            setDouble(rem.db)
        }
        frag.append(nodeRem)
    }
    $('#trainers-rematch').empty().append(frag)
}

function setPartyPanel(party) {
    if (party.length < 1) {
        return console.warn('party had team ' + party)
    }
    const frag = document.createDocumentFragment()
    for (const poke of party) {
        const pokeDiv = createPokemon(poke)
        pokeDiv.firstChild.onclick = () => {
            redirectSpecie(poke.spc)
        }
        frag.append(pokeDiv)
    }
    $('#trainers-team').empty().append(frag).append(getNodeRedirectToEditorPokemon(party))
}


export const statsOrder = [
    "HP",
    "Atk",
    "Def",
    "SpA",
    "SpD",
    "Spe",
]
export function createPokemon(poke) {
    const specie = gameData.species[poke.spc]
    const ability = gameData.abilities[specie.stats.abis[poke.abi]]
    const moves = poke.moves.map((x) => {
        return gameData.moves[x]
    })
    const item = gameData.items[poke.item]?.name
    const nature = gameData.natureT[poke.nature]

    const core = e('div', "trainers-pokemon")
    const leftPanel = e('div', "trainers-pokemon-left")
    const pokeName = e('div', "trainers-poke-specie", specie.name)
    const pokeImg = e('img', "trainer-poke-sprite")
    if (poke.isShiny) {
        pokeImg.src = getSpritesShinyURL(specie.NAME)
    } else {
        pokeImg.src = getSpritesURL(specie.NAME)
    }

    const pokeAbility = e('div', "trainers-poke-ability", ability?.name)
    const midPanel = e('div', "trainers-pokemon-mid")
    const pokeMoves = e('div', "trainers-poke-moves")
    for (const move of moves) {
        if (!move) continue
        let type1 = gameData.typeT[move.types[0]].toLowerCase()
        let moveName = move.name
        if (move.name === "Hidden Power"){
            const ivsFormatted = {
                hpIV: poke.ivs[0],
                attackIV: poke.ivs[1],
                defenseIV: poke.ivs[2],
                spAttackIV: poke.ivs[3],
                spDefenseIV: poke.ivs[4],
                speedIV: poke.ivs[5],
            }
            const HPType = getGEN3HP(ivsFormatted)
            moveName = "H.P. " + HPType
            type1 = HPType.toLowerCase()
        }
        pokeMoves.append(JSHAC([
            e('div', `trainers-poke-move ${type1}-t`), [
                e('span', '', moveName)
            ]
        ]))
    }
    const rightPanel = e('div', "trainers-pokemon-right")
    const pokeItem = e('div', "trainers-poke-item", item)
    const textNature = getTextNature(nature)
    const pokeNature = e('div', "trainers-poke-nature", textNature)
    
    const pokeStats = e('div', "trainers-stats-row")
    const nerfedBuffed = textNature.match(/((Def)|(SpA)|(Atk)|(SpD)|(Spe))/g)
    const statBuffed = nerfedBuffed?.[0]
    const statNerfed = nerfedBuffed?.[1]
    let fontRgb = window.getComputedStyle(document.body).color.match(/\d+/g)
    if (!fontRgb || fontRgb.length != 3) fontRgb = [255, 255, 255]

    for (const statIndex in statsOrder) {
        const stat = statsOrder[statIndex]
        const nerfedOrbuffed = stat === statBuffed ? "buffed" : stat === statNerfed ? "nerfed" : ""
        const evVal = poke.evs[statIndex]
        const evRow = e('div', `trainers-poke-evs`, evVal)
        evRow.style.color = `rgb(0, ${evVal}, 0)`
        const ivVal = poke.ivs[statIndex]
        const ivValNerfed = ivVal == 0 ? "nerfed" : ""
        pokeStats.append(JSHAC([
            e('div', 'trainers-stats-col'), [
                e('div', `trainers-stats-name ${nerfedOrbuffed}`, stat),
                e('div', `trainers-poke-ivs ${ivValNerfed}`, ivVal),
                evRow,
            ]
        ]))
    }

    return JSHAC([
        core, [
            leftPanel, [
                pokeName,
                pokeImg,
                pokeAbility
            ],
            rightPanel, [
                midPanel, [
                    pokeMoves,
                    pokeItem,
                    pokeNature
                ],
                pokeStats
            ]
        ]
    ])
}

const natureMap = {
    "Impish": "+Def -SpA",
    "Adamant": "+Atk -SpA",
    "Bold": "+Def -Atk",
    "Bashful": "--",
    "Jolly": "+Spe -SpA",
    "Gentle ": "+SpD -Def",
    "Calm": "+SpD -Atk",
    "Quiet": "+SpA -Spe",
    "Modest": "+SpA -Atk",
    "Timid": "+Spe -Atk",
    "Careful": "+SpD -SpA",
    "Hasty": "+Spe -Def",
    "Naughty": "+Atk -SpD",
    "Sassy": "+SpD -Spe",
    "Naive": "+Spe -SpD",
    "Brave": "+Atk -Spe",
    "Lonely": "+Atk -Def",
    "Relaxed": "+Def -Spe",
    "Lax": "+Def -SpD",
    "Hardy": "--",
    "Rash": "+SpA -SpD",
    "Mild": "+SpA -Def",
    "Quirky": "--",
    "Serious": "--",
    "Docile": "--",
}

export function getTextNature(nature) {
    return `${nature} (${natureMap[nature]})`
}

function getNodeRedirectToEditorPokemon(party) {
    const redirectTeamBuilder = () => {
        setFullTeam(party)
        $('#btn-species').click()
        if ($('#btn-species').find('.big-select').text() === "Species") $('#btn-species').click()
    }
    return JSHAC([
        e('div', 'trainer-go-edition', null, { onclick: redirectTeamBuilder }), [
            e('div', 'trainer-redirect-arrow', 'Edit In Builder →')
        ]
    ])
}

const prefixTree = {
    treeId: "trainer"
}

export function buildTrainerPrefixTrees(){
    prefixTree.name = {}
    gameData.trainers.forEach((x, i, arr)=>{
        //by the way i'm building the word array so i can match more widely *l*eader *w*inonna
        x.splicedName = x.fullName.split(' ').map(x => x.toLowerCase())
        for (const splice of x.splicedName){
            const prefix = splice.charAt(0)
            if (!prefixTree.name[prefix]) prefixTree.name[prefix] = []
            prefixTree.name[prefix].push({data: i, suggestions: x.name})
        }
        
    })
}


export const queryMapTrainers = {
    "name": (queryData, trainer) => {
        if (trainer.fullName.toLowerCase() === queryData) return [true, trainer.fullName, true]
        queryData = queryData.split(' ')
        if (!queryData.length) return false
        for (const subQueryData of queryData){
            let hasSlicedMatched = false
            for (const splice of trainer.splicedName){
                hasSlicedMatched = AisInB(subQueryData, splice) || hasSlicedMatched
            }
            if (!hasSlicedMatched) return false
        }
        return trainer.fullName
        
    },
    "map": (queryData, trainer) => {
        const map = gameData.mapsT[trainer.map]?.toLowerCase()
        if (map && AisInB(queryData, map)) return map
        return false
    },
    "specie": (queryData, trainer) => {
        const trainerMons = [].concat.apply(
            [], [
            trainer.party,
            [].concat.apply([], trainer.rem.map(x => x.party)),
            trainer.insane
        ]
        )
        for (const mon of trainerMons) {
            const pokemon = gameData.species[mon.spc].name.toLowerCase()
            if (AisInB(queryData, pokemon)) return pokemon
        }

        return false
    },
}
export function updateTrainers(searchQuery) {
    const trainers = gameData.trainers
    const nodeList = $('#trainers-list > .btn')
    let validID;
    const matched = queryFilter3(searchQuery, trainers, queryMapTrainers, prefixTree)
    const trainersLen = trainers.length
    for (let i = 0; i < trainersLen; i++) {
        const node = nodeList.eq(i)
        if (!matched || matched.indexOf(i) != -1) {
            if (!validID) validID = i
            node.show()
        } else {
            node.hide()
        }
    }
    //if the current selection isn't in the list then change
    if (matched && matched.indexOf(currentTrainerID) == -1 && validID) feedPanelTrainers(validID)
}