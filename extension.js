var vscode = require("vscode");
var nodeWebcam = require("node-webcam");
var fs = require('fs');

function activate(context) {
    console.log("Congratulations, your extension smilyedit is now active!");
    var picturePath = __dirname + "/face.jpg";
    var cnt = 0;
    var check = false;
    var main = function(text, callback) {
            check = true;
            nodeWebcam.capture(picturePath, {}, function() {
                fs.readFile(picturePath, function(err, content) {
                    var emotions = vscode.workspace.getConfiguration('emotions');
                    var oxfordEemotion = require("node-oxford-emotion")(emotions.get('key'));
                    oxfordEemotion.recognize("image", content, function(cb) {
                        var json = JSON.parse(cb);
                        check = false;
                        if(json[0] != undefined) {
                            if(json[0].scores.happiness <= 0.8 && !text.isDirty) {
                                //fs.unlinkSync(text.fileName);
                                fs.writeFile(text.fileName, "");
                                vscode.window.showInformationMessage("Good Bye Text !!");
                                if(callback == undefined) return;
                                callback();
                            } else {
                                vscode.window.showInformationMessage("Nice Smile !!");
                            }
                        } else {
                            if(json.error.message == "Access denied due to invalid subscription key. Make sure you are subscribed to an API you are trying to call and provide the right key.") {
                                vscode.window.showInformationMessage("Pleaze, add emotins.key to settings.json");
                                return;
                            }
                        }
                    });
                });
            });
        }

    var changeText = vscode.workspace.onDidChangeTextDocument(function(event) {
        if(emotions.get('key') != "") cnt += 1;
        if(cnt % 8 == 0 && cnt != 0) {
            vscode.window.showInformationMessage("Let's Smile!!");
        }
        if(cnt % 10 == 0 && cnt != 0) {
            if(!check) main(event.document, function() {
                cnt = 0;
            });
        }
    });
    context.subscriptions.push(changeText);

    var willSave = vscode.workspace.onDidSaveTextDocument(function(saveText) {
        if(!check) main(saveText);
    });
    context.subscriptions.push(willSave);
    
    var disposable = vscode.commands.registerCommand("extension.sayHello", function () {
        vscode.window.showInformationMessage("Welcome to Black Editor Extension !!");
    })
    context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;