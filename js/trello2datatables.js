var apiUrl = "https://api.trello.com/1/";
var apiKey = "b95541c57195de585dc0cb916265b8ab";
var boardId = "508721606e02bb9d570016ae";
var lists = new Array();
var cards = new Array();

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function listName(listId)
{
    var name = null;
    lists.forEach(function(list) {
        if (list.id === listId) {
            name = list.name;
        }
    })
    return name;
}

$(function()
{
    if (getUrlVars().board) {
        boardId = getUrlVars().board;
    }
    ;
    console.log("get board " + boardId);
    // board name and description: https://api.trello.com/1/boards/508721606e02bb9d570016ae/name
    $.ajax(
            {
                type: "GET",
                url: apiUrl + 'boards/' + boardId,
                data: "key=" + apiKey,
                dataType: "jsonp",
                success: function(data) {
                    $('#boardname').replaceWith('<a href="http://trello.com/board/' + boardId + '">' + data.name + '</a>');
                    $('#boarddesc').replaceWith(data.desc);
                },
                error: function(msg, url, line) {
                    console.log('error trapped in error: function(msg, url, line)');
                    console.log('msg = ' + msg + ', url = ' + url + ', line = ' + line);
                }
            });
    // lists on a board: https://api.trello.com/1/boards/508721606e02bb9d570016ae/lists
    $.ajax(
            {
                type: "GET",
                url: apiUrl + 'boards/' + boardId + '/lists/open',
                data: "key=" + apiKey,
                dataType: "jsonp",
                success: function(data) {
                    var x = 0;
                    data.forEach(function(list) {
                        lists[x] = new Object();
                        lists[x].name = list.name;
                        lists[x].id = list.id;
                        x++;
                    });
                },
                error: function(msg, url, line) {
                    console.log('error trapped in error: function(msg, url, line)');
                    console.log('msg = ' + msg + ', url = ' + url + ', line = ' + line);
                }
            });
    // cards on a board: https://api.trello.com/1/boards/508721606e02bb9d570016ae/cards/visible
    $.ajax(
            {
                type: "GET",
                url: apiUrl + 'boards/' + boardId + '/cards/visible',
                data: "key=" + apiKey,
                dataType: "jsonp",
                success: function(data) {
                    for (var i = 0; i < data.length; i++) {
                        cards[i] = new Object();
                        cards[i].name = data[i].name;
                        cards[i].id = data[i].id;
                        cards[i].votes = data[i].badges.votes;
                        cards[i].comments = data[i].badges.comments;
                        cards[i].list = listName(data[i].idList);
                        cards[i].url = data[i].shortUrl;
                        cards[i].desc = data[i].desc;
                    }
                    console.log("My cards: %o", cards);
                    renderDatatable();
                },
                error: function(msg, url, line) {
                    console.log('error trapped in error: function(msg, url, line)');
                    console.log('msg = ' + msg + ', url = ' + url + ', line = ' + line);
                }
            });
});
function renderDatatable()
{
    var oTable = $('#datatable').dataTable({
        "bProcessing": true,
        "bPaginate": false,
        "bLengthChange": false,
        "bFilter": true,
        "aaData": cards,
        "aoColumns": [
            {"mData": "name"},
            {"mData": "list"},
            {"mData": "votes"},
            {"mData": "comments"}
        ],
        "fnRowCallback": function(nRow, oData, iDisplayIndex) {
            $('td:eq(0)', nRow).html('<a href="' + oData.url + '" target="_blank">' +
                    oData.name + '</a>');
            return nRow;
        },
    });
}
function toggleVisibility(newSection)
{
    $(".section").not("#" + newSection).hide();
    $("#" + newSection).show();
}