on("ready",function(){    
    const cmdRegex = /^!importSpells (.*)$/i;

    on('chat:message',function(msg){    
        if('api' === msg.type && msg.content == '!importSpells') {    
    
            //let match=msg.content.match(cmdRegex);
            //match = match[0];

            //match = match.split(' ')[1];
            
            
            var selected = msg.selected;
            if (selected===undefined)
            {
                sendChat("API","Please select a character.");
                return;
            }
            var tok = getObj("graphic",selected[0]._id);
            var importMonster = getObj("character",tok.get("represents"));            
            /*
            var importMonster = findObjs({type:"character",name:match});
            if (importMonster[0]){
                importMonster = importMonster[0];
            } else {
                sendChat('GM','Could not find character.<br><br>Please use the following format:<br>!importSpells [character name].')
                return;                
            }
            */
            
            var abilityList = findObjs({type:"ability",characterid:importMonster.id});
            var macroList = findObjs({type:"macro"});
            
            _.each(abilityList,function(ability){
                _.each(macroList, function(macro){
                    //sendChat('gm','' + ability.get("name"));
                    //sendChat('gm','' + macro.get("name"));
                    //macroName = macro.get("name").replace(' ','');
                    
                    if (ability.get("name")==macro.get("name")){
                        newAction = macro.get("action");
						abilityAction = ability.get("action");
						casterLevel = newAction.match(/\?{Caster Level\?[A-Za-z0-9,|\/? ]+{[A-Za-z0-9,|\/? ]+}}/ig);           
						CL = abilityAction.match(/CL [\d]+/g);
						if (casterLevel && CL){
							CL = CL[0];
							CL = CL.split(' ')[1];
							//casterLevel = casterLevel[0];
							newAction = newAction.replace(/\?{Caster Level\?[A-Za-z0-9,|\/? ]+{[A-Za-z0-9,|\/? ]+}}/igm,CL);
						}
						spellDC = newAction.match(/\?{Spell DC\?[A-Za-z0-9,|\/? ]+{[A-Za-z0-9,|\/? ]+}}/ig);           
						DC = abilityAction.match(/DC [\d]+/g);
						//?{Spell DC?|Not,NaN|Custom, ?{Value?}}
						if (spellDC && DC){
							DC = DC[0];
							DC = DC.split(' ')[1];
							//spellDC = spellDC[0];
							newAction = newAction.replace(/\?{Spell DC\?[A-Za-z0-9,|\/? ]+{[A-Za-z0-9,|\/? ]+}}/igm,DC);
						}
						rangedQ = newAction.match(/\?{Ranged Attack Mod\?\|0}/ig);
						rangedMod = abilityAction.match(/ranged (?:-)?[\d]+/ig);
						if (rangedQ && rangedMod){
						    //rangedQ = rangedQ[0];
						    rangedMod = rangedMod[0];
						    rangedMod = rangedMod.split(' ')[1];
						    newAction = newAction.replace(/\?{Ranged Attack Mod\?\|0}/igm,rangedMod);
						}
						meleeQ = newAction.match(/\?{Melee Attack Mod\?\|0}/ig);
						meleeMod = abilityAction.match(/melee (?:-)?[\d]+/ig);
						if (meleeQ && meleeMod){
						    //meleeQ = meleeQ[0];
						    meleeMod = meleeMod[0];
						    meleeMod = meleeMod.split(' ')[1];
						    newAction = newAction.replace(/\?{Melee Attack Mod\?\|0}/igm,meleeMod);
						}
						
						
                        ability.set("action",newAction + ' {{name=@{character_name} }}');
                        newName = ability.get("name");
                        newName = newName.replace('zSPELL','SPELL');
                        ability.set("name",newName);
                    }
                    
                    
                });
                

            });
            
        }
    });
    
});
