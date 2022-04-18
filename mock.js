export const list = [
    {
        link: 'https://luatquanghuy.vn/wp-content/uploads/hop-dong-dien-tu-image-01.webp',
        height: 700,
        width: 500,
    },
    {
        link: 'https://luatquanghuy.vn/wp-content/uploads/hop-dong-dien-tu-image-01.webp',
        height: 700,
        width: 500,
    },
    {
        link: 'https://luatquanghuy.vn/wp-content/uploads/hop-dong-dien-tu-image-01.webp',
        height: 700,
        width: 500,
    },
];

export const listInput = [
    {
        type: '1',
        minWidth: 150,
        minHeight: 80,
        defaultWidth: 150,
        defaultHeight: 80,
        style: 'style_1',
        html: `
            <div
                draggable="true"
                class="item style_1"
                data-type="1"
            >
                Hello
            </div>
        `,
        htmlInsert: `
            <div class="editor style_1 item_main_drop" contenteditable="true" data-type="1">Hello</div>
        `,
    },
    {
        type: '2',
        minWidth: 50,
        minHeight: 50,
        defaultWidth: 70,
        defaultHeight: 70,
        style: 'style_2',
        html: `
        <img
            draggable="true"
            class="item style_2"
            data-type="2"
            src="https://khacdaunhanh247.com/upload/hinhanh/16072018-5716.png"
        /> `,
        htmlInsert: `
            <img
                draggable="true"
                class="item style_2"
                data-type="2"
                src="https://khacdaunhanh247.com/upload/hinhanh/16072018-5716.png"
            />
        `,
    },
];
