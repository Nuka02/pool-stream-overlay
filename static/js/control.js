$(document).ready(function(){
    // For individual player controls
    $("button[data-player]").click(function(){
        const player = $(this).data("player");
        const command = $(this).data("command");
        $.ajax({
            url: '/shotclock',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ player: player, command: command }),
            success: function(response) {
                console.log("Command executed:", response);
            },
            error: function(err) {
                console.error("Error executing command:", err);
            }
        });
    });

    // For the end of the rack button
    $("#end-rack").click(function(){
        $.ajax({
            url: '/shotclock',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ command: "end_rack" }),
            success: function(response) {
                console.log("Rack ended:", response);
            },
            error: function(err) {
                console.error("Error ending rack:", err);
            }
        });
    });
});
