const itemsModel = require("../schemas/items");
let createFilterStatus = (currentStatus) => {
    let statusFilter = [
        {name: "ALL", value: 'all', count: 4, link: "#", class: "default"},
        {name: "ACTIVE", value: 'active', count: 4, link: "#", class: "default"},
        {name: "UNACTIVE", value: 'unactive', count: 0, link: "#", class: "default"},
    ]

    statusFilter.forEach((item, index) => {
        let condition = {};
        if(item.value !== 'all') condition = {status: item.value};
        if(item.value === currentStatus) statusFilter[index].class = 'success';
        itemsModel.count(condition).then((data) => {
            statusFilter[index].count = data;
        });

    });
    return statusFilter;
}

module.exports = {
    createFilterStatus: createFilterStatus
}