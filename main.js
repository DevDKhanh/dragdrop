'use strict';

import {list, listInput} from './mock.js'

(() => {
    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);

    const mainList = $('#list_file');

    let infoItem = null;
    let isResize = false;
    let stateItem = {};//==> Chứa các thông tin các phần tử khi được thêm vào văn bản

    //**********************
    //* Hàm này sẽ lấy ra các item đã được thêm vào DOM
    //* Xử lí di chuyển vị trí, kích thước các item trong vùng chưa văn bản
    //**********************
    function getItemDrop() {
        const dropItems = $$('.item_drop');

        dropItems.forEach((el) => {
            const {page, id} = el.dataset;

            const item = stateItem[`${page}`].filter((item) => item.id === +id);
            const containerPage = $(`#page${page}`);

            /*---------- Xóa phần tử ----------*/
            el.addEventListener('click', function (e) {
                if (e.target.matches('.close')) {
                    const newSate = stateItem[`${page}`].filter((item) => item.id !== +id);
                    updateState(newSate, page);
                }
            });


            el.addEventListener('mousedown', function (e) {
                el.style.zIndex = '10';

                const maxX = containerPage.offsetWidth;
                const maxY = containerPage.offsetHeight;

                let left = el.offsetLeft;
                let top = el.offsetTop;

                /*---------- chiều rộng và chiều cao phần tử ----------*/
                const offsetHeight  = item[0].height;
                const offsetWidth  = item[0].width;

                /*---------- Vị trí hiện tại của con trỏ ----------*/
                let mouseX = e.clientX;
                let mouseY = e.clientY;

                if (e.target.matches('.resize-button')) {
                    isResize = true;
                } else {
                    isResize = false;
                }

                document.onmousemove = function (e) {
                    /*---------- Vị trí phần tử ----------*/
                    const dx = mouseX - e.clientX;
                    const dy = mouseY - e.clientY;
                    const px = left - dx;
                    const py = top - dy;

                    const X = getXY(px, maxX - offsetWidth);
                    const Y = getXY(py, maxY - offsetHeight);

                    if (!isResize) {
                        /********** Cập nhật style item **********/
                        el.style.left = X + 'px';
                        el.style.top = Y + 'px';

                        const newSate = stateItem[`${page}`].map((item) => {
                            if(item.id === +id) {
                                return {...item, X, Y};
                            }
                            return item;
                        });
                        updateState(newSate, page);
                    } else {
                        el.classList.add('show');

                        const {type} = el.dataset;
                        const startX = e.clientX;
                        const startY = e.clientY;

                        const infoItem = listInput.filter((item)=>item.type === type);

                        const startWidth = parseInt(
                            document.defaultView.getComputedStyle(el).width,
                            10
                        );
                        const startHeight = parseInt(
                            document.defaultView.getComputedStyle(el).height,
                            10
                        );

                        document.onmousemove = (e) => {
                            const {WIDTH, HEIGHT} = doDrag(
                                e,
                                { width: startWidth, height: startHeight },
                                { x: startX, y: startY },
                                { minWidth: infoItem[0].minWidth, minHeight: infoItem[0].minHeight},
                                { maxWidth: maxX, maxHeight: maxY},
                                { left: X, top: Y},
                            );

                            el.style.width = WIDTH + 'px';
                            el.style.height = HEIGHT + 'px';
                            const newSate = stateItem[`${page}`].map((item) => {
                                if(item.id === +id) {
                                    return {...item, width: WIDTH, height: HEIGHT};
                                }
                                return item;
                            });
                            updateState(newSate, page);
                        };
                    }
                };

                /*---------- Hủy event ----------*/
                document.addEventListener('mouseup', function () {
                    el.style.zIndex = '0';
                    document.onmousemove = null;
                    if (el.matches('.show')) {
                        el.classList.remove('show');
                    }
                });
            });
        });
    }

    //**********************
    //* Hàm này sẽ hiển thị các item bên thanh tab
    //**********************
    function renderItem() {
        const container = $('.main_input')
        container.innerHTML = listInput.map(item => item.html).join('')
    };

    //**********************
    //* Hàm này hiển thị các trang PDF 
    //**********************
    function renderListFiles() {
        mainList.innerHTML = list.map((file, index)=>{
            return (`
                <div 
                    ondragover="return false" 
                    class="drop"
                    style="width: ${file.width}px; height: ${file.height}px; position: relative" 
                >
                    <img
                        class="img_bg"
                        alt="abc"
                        src="${file.link}"
                    />
                    <div 
                        ondragover="return false" 
                        id="page${index+1}" 
                        class="main_drop" 
                        data-index="${index+1}"
                        style="width: ${file.width}px; height: ${file.height}px; position: absolute; top: 0; left: 0;" >
                    </div>
                </div> 
            `);
        }).join('');

    };

    //**********************
    //* Hàm này sẽ xử lí việc người dùng kéo, thả để thêm item vào vùng chứa văn bản
    //**********************
    function handlerDrop() {
        const listContainer = $$('.main_drop');

        function onDrop(ev, pageCurrent) {
            const {layerX, layerY} = ev;

            addItem(pageCurrent, layerX, layerY);
            ev.stopPropagation();
            return false;
        }

        listContainer.forEach((el)=> {
            const pageCurrent = el.dataset.index;
            el.addEventListener('drop', (ev) => onDrop(ev, pageCurrent))
        });
    };

    //**********************
    //* Hàm này sẽ thêm các phần tử vào văn bản
    //* index: số trang
    //* x: tọa độ x của trang, y: tọa độ y của trang (so với document)
    //**********************
    function addItem(index, x, y) {
        const page = $(`#page${index}`);

        const id = new Date().getTime();
        const {clientHeight, clientWidth} = page;
        const {type, style, htmlInsert, defaultWidth, defaultHeight} = infoItem;

        const top = y - defaultHeight / 2;
        const left = x - defaultWidth / 2;

        const X = getXY(left, clientWidth - defaultWidth);
        const Y = getXY(top, clientHeight - defaultHeight);

        !stateItem[`${index}`] ? stateItem[`${index}`] = []:null;
        stateItem[`${index}`].push({
            id,
            X,
            Y,
            type,
            width: defaultWidth,
            height: defaultHeight,
            pageNumber: index,
            htmlInsert,
            style,
        });
        renderItemOnPage();
    };

    function renderItemOnPage() {
        for(let i in stateItem) {
            const html = stateItem[i].map((item) => {
                /*---------- Tạo thẻ mới để chứa item ----------*/
                return (`
                    <div 
                        class="${item.style} item_drop" 
                        data-id="${item.id}" 
                        data-page="${item.pageNumber}"
                        data-type="${item.type}"
                        ondragover="return true"
                        style="
                            width: ${item.width}px; 
                            height: ${item.height}px;
                            left: ${item.X}px;
                            top: ${item.Y}px;
                        "
                    >
                        <div class="resize"></div>
                        <div class="close">X</div>
                        <svg
                            class="resize-button"
                            height="10" 
                            width="10"
                        >
                        </svg>
                        ${item.htmlInsert}
                    </div>`);
            });

            /*---------- Thêm item mới vào DOM ----------*/
            $(`#page${i}`).innerHTML = html.join('');
        }
        /*---------- Cập nhật lại các item ----------*/
        getItemDrop();
    }

    //**********************
    //* Hàm này sẽ tạo mới phần tử để chuẩn bị thêm vào vùng chưa vản bản
    //* Ví dụ: Chữ ký, ô check box,....
    //**********************
    function handlerCreateItem() {
        const items = $$('.item');

        function createItem(e) {
            const { type } = e.dataset;
            const info = listInput.filter((item) => item.type === type);

            infoItem = info[0];
        };

        items.forEach((el) =>
            el.addEventListener('drag', function () {
                createItem(el);
            })
        );
    };

    setInterval(()=>{
        console.log(stateItem);
    }, 2000)

    //**********************
    //* Site function
    //**********************
    function updateState (newSate, page) {
        stateItem[`${page}`] = newSate;
        renderItemOnPage();
    }

    function doDrag(e, startSize, start, minSize, maxSize,coordinates) {
        
        const width = startSize.width + e.clientX - start.x;
        const height = startSize.height + e.clientY - start.y;

        const WIDTH = coordinates.left + width < maxSize.maxWidth ? 
                        getWidthHeight(minSize.minWidth, width):
                        width - coordinates.left - (width - maxSize.maxWidth);

        const HEIGHT = coordinates.top + height < maxSize.maxHeight ? 
                        getWidthHeight(minSize.minHeight, height):
                        height - coordinates.top - (height - maxSize.maxHeight);

        return {WIDTH, HEIGHT};
    }

    function getWidthHeight(minSize, currentSize) {
        if(currentSize <= minSize) {
            return minSize;
        } else {
            return currentSize;
        };
    }

    function getXY(coordinates, max){
        if(coordinates < 0) {
            return 0
        } else {
            if(coordinates >= max) {
                return max;
            } else {
                return coordinates
            }
        }
    }

    function start() {

        /*---------- Hiển thị các file văn bản ----------*/
        renderListFiles();

        /*---------- Hiển thị list item thanh tab ----------*/
        renderItem();

        /*---------- Thêm sự kiện kéo, thả cho từng trang  ----------*/
        handlerDrop();

        /*---------- Lấy các phần tử đã được thêm vào vùng chưa văn bản, xử lí kéo thả trong vùng chứa ----------*/
        getItemDrop();

        /*---------- Xử lí tạo mới item ----------*/
        handlerCreateItem();
    };

    start();
})();