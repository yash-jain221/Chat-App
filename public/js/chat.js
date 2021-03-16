const socket = io()

const $messageForm = document.getElementById('message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.getElementById('sendloc')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll = () =>{
    const $newMessage = $messages.lastElementChild

    const newMessagesStyles = getComputedStyle($newMessage)
    const newMessageMargin  = parseInt(newMessagesStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight

    const scroolOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scroolOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('LocationMessage',(loc)=>{
    console.log(loc)
    const url = Mustache.render(locationTemplate,{
        username:loc.username,
        loc:loc.url,
        createdAt:moment(loc.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',url)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')

    const text = e.target.elements.messinput.value
    socket.emit('sendMessage',text,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

document.querySelector('#sendloc').addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert("Geolocation is not supported by your browser")
    }
    $locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        const lat = position.coords.latitude
        const long = position.coords.longitude
        socket.emit('sendLocation',{latitude:lat,longitude:long},()=>{
            console.log("Location shared!")
            $locationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join',{username, room},(error)=>{
    if(error){
        alert(error) 
        location.href = '/'
    }
})