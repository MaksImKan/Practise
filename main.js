const formSearch = document.querySelector('.form-search'),
    inputCitiesFrom = document.querySelector('.input__cities-from'),
    dropdownCitiesFrom = document.querySelector('.dropdown__cities-from'),
    inputCitiesTo = document.querySelector('.input__cities-to'),
    dropdownCitiesTo = document.querySelector('.dropdown__cities-to'),
    inputDateDepart = document.querySelector('.input__date-depart'),
    cheapestTicket = document.getElementById('cheapest-ticket'),
    otherCheapTickets = document.getElementById('other-cheap-tickets');

const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
    proxy = 'https://cors-anywhere.herokuapp.com/',
    API_KEY = '07beb374af9ced1e84d22462034e968b',
    calendar = 'http://min-prices.aviasales.ru/calendar_preload';
    MAX_COUNT = 10;



let city = [];
    // cheapTicket = [];



const getData = (url, callback) => {
    const request = new XMLHttpRequest();
    request.open('GET', url);

    request.addEventListener('readystatechange', () => {
        if (request.readyState !== 4) return

        if (request.status === 200) {
            callback(request.response);
        }else{
            console.error(request.status);
            
        }
        
    })

    request.send();
}


const showCity = (input, list) => {

    list.textContent = ''

    if (input.value !== '') {
        
    
        const filterCity = city.filter((item) => {
            if (item.name) {
                const fixItem = item.name.toLowerCase();
                return fixItem.startsWith(input.value.toLowerCase())
            }
        });
        
        filterCity.forEach(item => {
            const li =  document.createElement('li');
            li.classList.add('dropdown__city')
            li.textContent = item.name;
            
            list.append(li)

        });
    
    }

}


const selectCity = (event, input, list ) => {
    if(event.target.classList.contains('dropdown__city')){
        input.value = event.target.textContent;
        list.textContent = ''
    } 
}



const getNameCity = (code) => {
    const objCity = city.find((item) => item.code === code)
    return objCity.name
}

const getDate = (date) => {
    return new Date(date).toLocaleString('ru', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}


const getLinkAviasales = (data) => {
    let link = 'https://www.aviasales.ru/search/'

    link += data.origin

    const date = new Date(data.depart_date)    

    const day = date.getDate()

    link += day < 10 ? '0' + day: day

    const month =  date.getMonth() + 1

    link += month < 10 ? '0' + month: month

    link += data.destination

    link += '1'



    return link
    // SVX2905KGD1
}
const getChanges = (num) => {
    if(num){
        return num === 1 ? 'C одной пересадкой' : 'С двумя пересадками'
    }else{
        return 'Без пересадок'
    }
}
const createCard = (data) => {
    const ticket = document.createElement('article');
    ticket.classList.add('ticket');

    let deep = ''

    if(data){
        deep= `
            <h3 class="agent">${data.gate}</h3>
            <div class="ticket__wrapper">
                <div class="left-side">
                    <a href="${getLinkAviasales(data)}" target ="blank" class="button button__buy">Купить
                        за ${data.value}₽</a>
                </div>
                <div class="right-side">
                    <div class="block-left">
                        <div class="city__from">Вылет из города
                            <span class="city__name">${getNameCity(data.origin)}</span>
                        </div>
                        <div class="date">${getDate(data.depart_date)}</div>
                    </div>
            
                    <div class="block-right">
                        <div class="changes">${getChanges(data.number_of_changes)}</div>
                        <div class="city__to">Город назначения:
                            <span class="city__name">${getNameCity(data.destination)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    }else{
        deep='<h3>Билетов по даной дате нет в наличии</h3>'
    }
    
    ticket.insertAdjacentHTML('afterbegin', deep)

    return ticket
}


const renderCheapDay = (cheapTicket) => {
    cheapestTicket.style.display = 'block'

    const ticket = createCard(cheapTicket[0]);

    cheapestTicket.innerHTML= '<h2>Самый дешевый билет на выбранную дату</h2>'

    cheapestTicket.append(ticket)
    
}

const renderCheapYear = (cheapTickets) => {
    otherCheapTickets.style.display = 'block'

    otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>' 

    cheapTickets.sort( (a, b) => a.value - b.value);

    console.log(cheapTickets);
    
    for(let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++) {

        const ticket = createCard(cheapTickets[0])

        otherCheapTickets.append(ticket)

    }
}

const renderCheap = (data, date) => {
    const cheapTicketYear = JSON.parse(data).best_prices

    const cheapTicketDay = cheapTicketYear.filter((item) => {
            return item.depart_date === date
    })

    renderCheapDay(cheapTicketDay);
    renderCheapYear(cheapTicketYear);
    
    
}

inputCitiesFrom.addEventListener('input', () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom)
})

inputCitiesTo.addEventListener('input', () => {
    showCity(inputCitiesTo, dropdownCitiesTo)
})

inputCitiesTo.addEventListener('focus', () => {
    showCity(inputCitiesTo, dropdownCitiesTo)
})

dropdownCitiesFrom.addEventListener('click', (event) => {
    selectCity(event, inputCitiesFrom, dropdownCitiesFrom )
})

dropdownCitiesTo.addEventListener('click', (event) => {
    selectCity(event, inputCitiesTo, dropdownCitiesTo)
})

formSearch.addEventListener('submit', (e) => {
    e.preventDefault()

    

    const FormData = {
        from: city.find(item => inputCitiesFrom.value === item.name),
        to: city.find(item => inputCitiesTo.value === item.name),
        when: inputDateDepart.value
    }

    if(FormData.from && FormData.to){

        const requestData = '?depart_date=' + FormData.when + '&origin=' 
        + FormData.from.code + '&destination=' + FormData.to.code + '&one_way=true&token=' + API_KEY;
        

        getData(proxy + calendar + requestData, (response) => {
    
            renderCheap(response, FormData.when)
            
        })
    }else{
        alert('Введите коректно название города')
    }
})

getData(proxy + citiesApi, (data) => {
   
    city = JSON.parse(data)
    
    city.sort( (a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        // a должно быть равным b
        return 0;
      });
})




