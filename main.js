'use strict';
const ddjs = ({
    idContainer = '',
    idMainInput = '',
    idPreview = '',
    listInput = [],
    listPreviewInput = [],
}) => {
    const mainList = document.getElementById(`${idContainer}`);
    const previewContainer = document.getElementById(`${idPreview}`);

    let infoItem = null;
    let isResize = false;
    let stateItem = {}; //==> Chứa các thông tin các phần tử khi được thêm vào văn bản

    //**********************
    //* Hàm này sẽ lấy ra các item đã được thêm vào DOM
    //* Xử lí di chuyển vị trí, kích thước các item trong vùng chưa văn bản
    //**********************
    function getItemDrop() {
        const dropItems = document.querySelectorAll('.item_drop');

        dropItems.forEach((el) => {
            const { page, id, type } = el.dataset;
            const containerPage = document.querySelector(`#page${page}`);

            /*---------- Xóa phần tử ----------*/
            el.onclick = function (e) {
                if (e.target.matches('.close')) {
                    const newSate = stateItem[`${page}`].filter(
                        (item) => item.id !== +id
                    );
                    /*---------- Update item---------*/
                    updateState(newSate, page);

                    /*---------- Render lại item---------*/
                    renderItemOnPage();

                    /*---------- Clean preview ----------*/
                    previewContainer.innerHTML = '';
                }
            };

            el.onmousedown = function (e) {
                const item = stateItem[`${page}`].filter(
                    (item) => item.id === +id
                );

                document.onmouseup = null;
                el.style.zIndex = '10';

                const maxX = containerPage.offsetWidth;
                const maxY = containerPage.offsetHeight;

                let left = el.offsetLeft;
                let top = el.offsetTop;

                /*---------- chiều rộng và chiều cao phần tử ----------*/
                const offsetHeight = item[0].height;
                const offsetWidth = item[0].width;

                /*---------- Vị trí hiện tại của con trỏ ----------*/
                let mouseX = e.clientX;
                let mouseY = e.clientY;

                if (e.target.matches('.resize-button')) {
                    isResize = true;
                } else {
                    isResize = false;
                }

                /*---------- update text content, html cập nhật state ----------*/
                document.onkeyup = function (e) {
                    const el = document.getElementById(id);
                    const content = el.outerText;
                    const innerHTML = el.innerHTML;

                    const newSate = stateItem[`${page}`].map((item) => {
                        if (item.id === +id) {
                            return { ...item, content, htmlInsert: innerHTML };
                        }

                        return item;
                    });

                    /*---------- Update item---------*/
                    updateState(newSate, page);

                    /*---------- Hiển thị các ô input ----------*/
                    renderPreview({ type, page, id });
                };

                /*---------- update vị trí của item cập nhật state ----------*/
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
                            if (item.id === +id) {
                                return { ...item, X, Y };
                            }
                            return item;
                        });
                        updateState(newSate, page);
                    } else {
                        el.classList.add('show');

                        const { type } = el.dataset;
                        const startX = e.clientX;
                        const startY = e.clientY;

                        const infoItem = listInput.filter(
                            (item) => item.type === type
                        );

                        const startWidth = parseInt(
                            document.defaultView.getComputedStyle(el).width,
                            10
                        );
                        const startHeight = parseInt(
                            document.defaultView.getComputedStyle(el).height,
                            10
                        );

                        document.onmousemove = (e) => {
                            const { WIDTH, HEIGHT } = doDrag(
                                e,
                                { width: startWidth, height: startHeight },
                                { x: startX, y: startY },
                                {
                                    minWidth: infoItem[0].minWidth,
                                    minHeight: infoItem[0].minHeight,
                                },
                                { maxWidth: maxX, maxHeight: maxY },
                                { left: X, top: Y }
                            );

                            el.style.width = WIDTH + 'px';
                            el.style.height = HEIGHT + 'px';
                            const newSate = stateItem[`${page}`].map((item) => {
                                if (item.id === +id) {
                                    return {
                                        ...item,
                                        width: WIDTH,
                                        height: HEIGHT,
                                    };
                                }
                                return item;
                            });
                            updateState(newSate, page);
                        };
                    }
                };

                /*---------- Hủy event ----------*/
                document.onmouseup = function () {
                    /*---------- Hiển thị các ô input ----------*/
                    renderPreview({ type, page, id });

                    el.style.zIndex = '0';

                    document.onmousemove = null;
                    if (el.matches('.show')) {
                        el.classList.remove('show');
                    }
                };
            };
        });
    }

    //**********************
    //* Render preview input
    //**********************
    function renderPreview({ type, id, page }) {
        previewContainer.innerHTML = listPreviewInput.filter(
            (item) => item.type === type
        )[0].htmls;

        getInfoItem({ id, page });
    }

    //**********************
    //* Hàm này sẽ hiển thị các item bên thanh tab
    //**********************
    function renderItem() {
        const container = document.getElementById(`${idMainInput}`);
        container.innerHTML = listInput.map((item) => item.html).join('');
    }

    //**********************
    //* Hàm này hiển thị các trang PDF
    //**********************
    function renderListFiles() {
        pdfjsLib.getDocument('./test.pdf').promise.then((doc) => {
            if (doc) {
                let htmls = '';
                for (let i = 1; i <= doc._pdfInfo.numPages; i++) {
                    htmls += `<div
                    ondragover="return false"
                    class="drop"
                    data-index="${i}"
                    style="width: 700px; position: relative"
                >
                    <canvas id="my_canvas_${i}"></canvas>
                    <div
                        ondragover="return false"
                         id="page${i}"
                        class="main_drop"
                        data-index="${i}"
                        style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;" >
                    </div>
                </div> `;
                }
                mainList.innerHTML = htmls;

                for (let i = 1; i <= doc._pdfInfo.numPages; i++) {
                    doc.getPage(i).then((page) => {
                        if (page) {
                            var myCanvas = document.querySelector(
                                `#my_canvas_${i}`
                            );
                            var context = myCanvas.getContext('2d');
                            var viewport = page.getViewport(3);
                            myCanvas.width = viewport.width;
                            myCanvas.height = viewport.height;
                            page.render({
                                canvasContext: context,
                                viewport: viewport,
                            });
                        }
                    });
                }

                /*---------- Thêm sự kiện kéo, thả cho từng trang  ----------*/
                handlerDrop();
            }
        });
    }

    //**********************
    //* Hiển thị item trên trang văn bản
    //**********************
    function renderItemOnPage() {
        for (let i in stateItem) {
            const html = stateItem[i].map((item) => {
                /*---------- Tạo thẻ mới để chứa item ----------*/
                return `
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
                        <div id="${item.id}" style="width: 100%; height: 100%;">
                            ${item.htmlInsert}
                        </div>
                    </div>`;
            });

            /*---------- Thêm item mới vào DOM ----------*/
            document.querySelector(`#page${i}`).innerHTML = html.join('');
        }
        /*---------- Cập nhật lại các item ----------*/
        getItemDrop();
    }

    //**********************
    //* Lấy thông số của item
    //**********************
    function getInfoItem({ id, page }) {
        const info = stateItem[`${page}`].filter((item) => item.id === +id)[0];

        const dataItem = {
            x: info.X,
            y: info.Y,
            height: info.height,
            width: info.width,
            content: info.content,
        };

        displayInfoItem({ dataItem });
    }

    //**********************
    //* Hiển thị thông tin của item lên ô input
    //**********************
    function displayInfoItem({ dataItem }) {
        const inputX = document.getElementById('inputX');
        const inputY = document.getElementById('inputY');
        const inputWidth = document.getElementById('inputWidth');
        const inputHeight = document.getElementById('inputHeight');
        const inputContent = document.getElementById('inputContent');

        if (inputX) inputX.value = dataItem.x;
        if (inputY) inputY.value = dataItem.y;
        if (inputWidth) inputWidth.value = dataItem.width;
        if (inputHeight) inputHeight.value = dataItem.height;
        if (inputContent) inputContent.value = dataItem.content;
    }

    //**********************
    //* Hàm này sẽ xử lí việc người dùng kéo, thả để thêm item vào vùng chứa văn bản
    //**********************
    function handlerDrop() {
        const listDrop = document.querySelectorAll('.drop');

        function onDrop(ev, el, pageCurrent) {
            const { pageX, pageY } = ev;
            const { offsetLeft, offsetTop } = el;
            addItem(pageCurrent, pageX - offsetLeft, pageY - offsetTop);
            ev.stopPropagation();
            return false;
        }

        listDrop.forEach((el) => {
            const pageCurrent = el.dataset.index;
            el.addEventListener('drop', (ev) => onDrop(ev, el, pageCurrent));
        });
    }

    //**********************
    //* Hàm này sẽ thêm các phần tử vào văn bản
    //* index: số trang
    //* x: tọa độ x của trang, y: tọa độ y của trang (so với document)
    //**********************
    function addItem(index, x, y) {
        const page = document.querySelector(`#page${index}`);

        const id = new Date().getTime();
        const { clientHeight, clientWidth } = page;
        const {
            type,
            style,
            htmlInsert,
            defaultWidth,
            defaultHeight,
            defaultContent,
        } = infoItem;

        const top = y - defaultHeight / 2;
        const left = x - defaultWidth / 2;

        const X = getXY(left, clientWidth - defaultWidth);
        const Y = getXY(top, clientHeight - defaultHeight);

        !stateItem[`${index}`] ? (stateItem[`${index}`] = []) : null;
        stateItem[`${index}`].push({
            id,
            X,
            Y,
            type,
            width: defaultWidth,
            height: defaultHeight,
            content: defaultContent,
            pageNumber: index,
            htmlInsert,
            style,
        });
        renderItemOnPage();
    }

    //**********************
    //* Hàm này sẽ tạo mới phần tử để chuẩn bị thêm vào vùng chưa vản bản
    //* Ví dụ: Chữ ký, ô check box,....
    //**********************
    function handlerCreateItem() {
        const items = document.querySelectorAll('.item');

        function createItem(e) {
            const { type } = e.dataset;
            const info = listInput.filter((item) => item.type === type);

            infoItem = info[0];
        }

        items.forEach((el) =>
            el.addEventListener('drag', function () {
                createItem(el);
            })
        );
    }

    //**********************
    //* Site function
    //**********************
    function updateState(newSate, page) {
        stateItem[`${page}`] = newSate;
    }

    function doDrag(e, startSize, start, minSize, maxSize, coordinates) {
        const width = startSize.width + e.clientX - start.x;
        const height = startSize.height + e.clientY - start.y;

        const WIDTH =
            coordinates.left + width < maxSize.maxWidth
                ? getWidthHeight(minSize.minWidth, width)
                : width - coordinates.left - (width - maxSize.maxWidth);

        const HEIGHT =
            coordinates.top + height < maxSize.maxHeight
                ? getWidthHeight(minSize.minHeight, height)
                : height - coordinates.top - (height - maxSize.maxHeight);

        return { WIDTH, HEIGHT };
    }

    function getWidthHeight(minSize, currentSize) {
        if (currentSize <= minSize) {
            return minSize;
        } else {
            return currentSize;
        }
    }

    function getXY(coordinates, max) {
        if (coordinates < 0) {
            return 0;
        } else {
            if (coordinates >= max) {
                return max;
            } else {
                return coordinates;
            }
        }
    }

    async function start() {
        /*---------- Hiển thị các file văn bản ----------*/
        renderListFiles();

        /*---------- Hiển thị list item thanh tab ----------*/
        renderItem();

        /*---------- Lấy các phần tử đã được thêm vào vùng chưa văn bản, xử lí kéo thả trong vùng chứa ----------*/
        getItemDrop();

        /*---------- Xử lí tạo mới item ----------*/
        handlerCreateItem();
    }

    start();

    return {
        getState: () => {
            return stateItem;
        },
        getItemPage: (numPage) => {
            return stateItem[numPage];
        },
    };
};
