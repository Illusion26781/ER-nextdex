import {e, JSHAC} from "./utils.js"

const loadMsgs = []
let error = false

export function load(callback, msg, lastOne=false){
    loadMsgs.push(msg)
    try{
        $('#loading').append(JSHAC([
            e('div', 'loading-row'),[ 
                e('div', 'loading-text', `loading ${msg}`),
                e('div', 'loading-icons', '⟳'),
            ]
        ]))
        callback()
        loaded(msg, true)
    } catch(_e){
        loaded(msg, false)
    } finally{
        if (lastOne) endLoad()
    }
}

function loaded(msg, success){
    const jNode = $('#loading').children().eq(loadMsgs.indexOf(msg))
    jNode.find('.loading-icons').text(success ? '✅' : '❌')
    jNode.find('.loading-text').text(`${msg}`)
    error = !success || error
}

function onErrorAskContinue(){
    $('#loading-screen').show()
    $('#loading').append(e('div', 'loading-ask', 'An error occured, click to continue'))
    
    $('#loading').on('click', function(){
        $('#loading-screen').hide(),
        $('#loading').off('click')
    })
}

function endLoad(){
    if (!error) {
        $('#loading-screen').hide()
    } else {
        onErrorAskContinue()
    }
}