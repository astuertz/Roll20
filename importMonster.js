//Import Monster stats into 3.5 Character Sheet (Diana P).
//Create a new character sheet, select the 'NPC' option.
//Fill out all of the empty spaces with a "1" or some other character.
//This is to populate the Attributes that we will need.

//Currently, the script checks for existing attributes for ability scores only
//making sure to populate those attributes if they do not already exist
//before attempting to update their values. However, this error checking
//is a work-in-progress. So it is still advised to make sure
//that you populate all fields before running the script.

//Copy SRD info and put into "other" field of PC character sheet.
//It is recommended that you copy your text as "plain text"
//Type !importMonster into the chat to extract data from field.
//You should see the sheet populate quite quickly.
//Make adjustments to the text as needed.
//Potentially, automatic macro creation in the future.
//Written by Anthony Stuertzel, based on the code by Chris S.
//For now, the Character Sheet has to be named "importMonster" (case sensitive).
//Also, here's the website for the Wolf SRD I used to test everything:
//https://www.d20srd.org/srd/monsters/wolf.htm
//If you're copying from a shorter block from a book, use the shortblockMonster
//script instead. It is specifically designed around these truncated stat blocks.

//Additionally, a new feature keeps a running tab of error codes
//So that at the end of the script, it will populate the chat with all
//found errors. This will let you know in one convenient block of text
//whether anything was unsuccesfful.



//Command !deleteMacros deletes all macros for creature "importMonster"
//Command !createskillMacros adds macros for each skill, parsing the information from the Skills line of NPC character sheet for character "importMonster"
//Command !createattackMacros adds Single Attacks and Full Attacks from the npcattack and npcfullattack field
//Note: this is designed around normal attacks that have an attack roll and damage.
//It parses "and" and "or" to figure out how to make the macros.
//If an attack does not have a +/- modifier to attack roll, or doesn't have a #d#+#.
//Therefore, if an attack is just 1d6, you need to add a +0 to it for proper formatting.


on("ready",function(){
    on("chat:message",function(msg){
        if(msg.type=="api" && msg.content.indexOf("!importMonster")==0){
            
			//Simple function to create an announcement in chat log.
			function chatAnnounce(announce) {
                  sendChat('importMonster',announce);
  			}
  
			function findAttribute(attributeName){
			    foundAttribute = findAttributeExec(attributeName);
        		if (typeof foundAttribute == 'undefined') {
    			    createAttribute(attributeName);
    			    foundAttribute = findAttribute(attributeName);
    			}
    			return foundAttribute;
			}
			
			function findAttributeExec(attributeName){
			    let foundAttribute = findObjs({
                _characterid: importMonster.id,
                _type: "attribute",
                name: attributeName
                });
                if (foundAttribute){
                foundAttribute = foundAttribute[0];
                }
                return foundAttribute;
			}

			function createAttribute(attributeName){
			createObj("attribute", {
                        name: attributeName,
                        current: '0',
                        characterid: importMonster.id
                        });
			}
			
			var errorMsg = '';
			
			function notFound(addError,errorText){
			errorMsg = errorMsg + '<br>' + addError;
			return errorMsg;
			}

  			
            //store character id in variable character.
            var importMonster = findObjs({ type: "character", name: "importMonster" });
            importMonster = importMonster[0];
            if (!importMonster){
                chatAnnounce('Please create monster "importMonster" (case sensitive)');
                return;
            }
            

            //grabs the contents of the other text field on character sheet
            var other = getAttrByName(importMonster.id, "other");
            if (!other){
                chatAnnounce('Please copy and paste monster text into "other" field of character sheet in PC section');
                return;
            }
            var other = other.replace('–','-');
            //Renames labels in field "other" for simplified monster statblocks
            //Checks that text contains the words "Short Block"
            //Add "Size/Type:" before creature size/type manually


            //If str is found, update npcstr attribute, else error message.
            function generateabilityScores(regexA,regextextA,abilityA,abilityM,abilityScore){
                var match = other.match(regexA);    
                if(match){
                    var regex = match[0];
       		 	    regex = regex.split(' ')[1]; //Grab value from regex
    			} else {
    			    //If no match found, set value to '10' and add error message
                    let addError = 'No value for ' + abilityScore + ' found.';
                    errorMsg = notFound(addError);
                    addError = '' + abilityScore + ' Mod set to default 0';
                    errorMsg = notFound(addError);
                 }
    			let attributeName = abilityA;
    			foundAttribute = findAttribute(attributeName); //store attribute id in foundAttribute
    			regex = parseInt(regex,10);
                if (isNaN(regex)){ //if Str is not a number, grab text
    			    match = other.match(regextextA); //grab whatever is there.
    			    if (match){
        			    regex = match[0];
        			    regex = regex.split(' ')[1]; //use whatever character is there as Str
                        foundAttribute.set("current", regex); //update value for attribute with text
                        mod = 10; //change value of regex to 10 for ability mod
    			    } else {
    			        regex = 10; //if no match, default to 10
    			        let addError = '' + abilityScore + ' could not be found in text';
                        errorMsg = notFound(addError);
                        foundAttribute.set("current", regex); //update value for attribute with 10
                        mod = 10;

    			    }
        			let addError = '' + abilityScore + ' not a number<br>' + abilityScore + ' Mod set to 0.';
                    errorMsg = notFound(addError);
    			} else {
                    foundAttribute.set("current", regex); //update value normally
                    mod = regex;
    			}
                attributeName = abilityM;
    			foundAttribute = findAttribute(attributeName);
			    mod = mod - 10;
                mod /= 2;
                mod = Math.floor(mod);
                if (isNaN(mod)){
                    mod = 0;
                }
    			foundAttribute.set("current", mod);
                return errorMsg;
            }
            
            //Array of strings to be used in generating ability scores
            var abilityScore = new Array('Str','Dex','Con','Wis','Int','Cha');
            var abilityAttribute = new Array('npcstr','npcdex','npccon','npcwis','npcint','npccha');
            var abilityMod = new Array('npcstr-mod','npcdex-mod','npccon-mod','npcwis-mod','npcint-mod','npccha-mod');
                        
            //Generate ability scores using generateabilityScores and generated arrays
            for (i=0; i < 6; i++){
            //searching other text for str
                let abilityRegex = '' + abilityScore[i] + '\\s[\\d]+';
                regexAbility = new RegExp(abilityRegex,'ig');
                let abilitytextRegex = '' + abilityScore[i] + '\\s[\\S]';
                regextextAbility = new RegExp(abilitytextRegex);
                errorMsg = generateabilityScores(regexAbility,regextextAbility,abilityAttribute[i],abilityMod[i],abilityScore[i]);
            }    
            
            
            
            
            match = other.match(/Fort [+-][\d]+/ig);
            //If Fort is found, update attribute, else error message.
            if(match){
                var regex = match[0];
                regex = regex.split(/[+-]/)[1];
                attributeName = 'npcfortsave';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);
            } else {
                    addError = 'Fort Mod not found';
                    errorMsg = notFound(addError);                
            }
            
            
            match = other.match(/Ref [+-][\d]+/ig);
            //If Ref is found, update attribute, else error message.
            if(match){
                var regex = match[0];
                regex = regex.split(/[+-]/)[1];
                attributeName = 'npcrefsave';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);
            } else {
                    addError = 'Ref Mod not found';
                    errorMsg = notFound(addError); 
            }
            
            
            
            match = other.match(/Will [+-][\d]+/ig);
            //If Will is found, update attribute, else error message.
            if(match){
                var regex = match[0];
                regex = regex.split(/[+-]/)[1];
                attributeName = 'npcwillsave';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);
            } else {
                    addError = 'Will Mod not found';
                    errorMsg = notFound(addError); 
            }

            
            match = other.match(/(?:Size\/Type:)?\s*(fine|diminutive|tiny|small|medium|large|huge|gargantuan|colossal) ([a-zA-Z0-9 ]+)/ig);
            //If Size/Type is found, update attribute, else error message.
            if(match){
                var regex = match[0];
                regex = regex.replace(/Size\/Type:\s*/, '');
                attributeName = 'npctype';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);
                attributeName = 'npcsize';
    			foundAttribute = findAttribute(attributeName);
                sizemod = regex.split(' ')[0];
                switch (sizemod) {
                    case 'Fine':
                        foundAttribute.set("current",8);
                        break;
                    case 'Diminutive':
                        foundAttribute.set("current",4);
                        break;
                    case 'Tiny':
                        foundAttribute.set("current",2);
                        break;
                    case 'Small':
                        foundAttribute.set("current",1);
                        break;
                    case 'Medium':
                        foundAttribute.set("current",0);
                        break;
                    case 'Large':
                        foundAttribute.set("current",-1);
                        break;
                    case 'Huge':
                        foundAttribute.set("current",-2);
                        break;
                    case 'Gargantuan':
                        foundAttribute.set("current",-4);
                        break;
                    case 'Colossal':
                        foundAttribute.set("current",-8);
                        break;
                    default:
                        foundAttribute.set("current",0);
                }
                        
                        
            } else {
                addError = 'Type/Size not found';
                errorMsg = notFound(addError);                 
            }


            match = other.match(/Armor Class:\s*([\d]+)/ig);
            //If armorclass is found, update attribute, else error message.
            if(match){
                var regex = match[0];
                regex = regex.replace(/Armor Class:\s*/, '');
                attributeName = 'npcarmorclass';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);
            } else {
                addError = 'Armor Class not found';
                errorMsg = notFound(addError);                  
            }
            
            
            
            match = other.match(/touch ([\d]+)/ig);
            //If touch is found, update attribute, else error message.
            if(match){
                var regex = match[0];
                regex = regex.replace('touch ', '');
                //regex = regex.replace(' ', '');
                attributeName = 'npctoucharmorclass';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);
            } else {
                addError = 'touch AC not found';
                errorMsg = notFound(addError);                  
            }
            
            
            match = other.match(/flat-footed ([\d]+)/ig);
            //If flat-footed is found, update attribute, else error message.
            if(match){
                var regex = match[0];
                regex = regex.replace('flat-footed ', '');
                attributeName = 'npcflatfootarmorclass';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);
            } else {
                addError = 'Flat-footed AC not found';
                errorMsg = notFound(addError);                  
            }
            
            
            match = other.match(/Armor Class:\s[\d]+\s\(.*\)/ig);
            //If armorclassinfo is found, update attribute, else error message.
            if(match){
                var regex = match[0];
                regex = regex.replace(/Armor Class:\s*[\d]*[\s]/, '');
                regex = regex.replace('\(', '');
                regex = regex.replace('\)', '');
                attributeName = 'npcarmorclassinfo';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);
            } else {
                addError = 'AC info/description not found';
                errorMsg = notFound(addError);                  
            }
            
            
            match = other.match(/(?:Hit Dice:\s*)([\d]+d[\d]+[+\-–][\d]*)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Hit Dice:\s*/,'');
                attributeName = 'npchitdie';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);
            } else {
                addError = 'Hit Dice not found';
                errorMsg = notFound(addError);                  
            }
            
            match = other.match(/\([\d]* hp\)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace('hp','');
                regex = regex.replace('(','');
                regex = regex.replace(')','');
                regex = regex.replace(/\s*/, '');
                attributeName = 'npchitpoints';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);
                foundAttribute.set("max",regex);
            } else {
                addError = 'HP not found';
                errorMsg = notFound(addError);                  
            }
            
            match = other.match(/Base Attack\/Grapple:\s*([+-]*[\d]+)\/([+-]*[\d]+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Base Attack\/Grapple:\s*/,'');
                regex = regex.replace('+', '');
                regex = regex.replace('-','');
                regex = regex.split('/');
                baseAtt = regex[0];
                grapple = regex[1];
                attributeName = 'npcbaseatt';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", baseAtt);               
                attributeName = 'npcgrapple';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current",grapple);
            } else {
                addError = 'Base Attack/Grapple not found';
                errorMsg = notFound(addError);                  
            }
            
            match = other.match(/Initiative:\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Initiative:\s*/,'');
                regex = regex.replace(/[+-]/,'');
                attributeName = 'npcinit';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);
            } else {
                addError = 'Initiative not found';
                errorMsg = notFound(addError);                  
            }
            
            
            
            match = other.match(/Speed:\s*([\d]+)(.*)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Speed:\s*/,'');
                attributeName = 'npcspeed';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Speed not found';
                errorMsg = notFound(addError);                  
            }


            match = other.match(/Skills:\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Skills:\s*/,'');
                attributeName = 'npcskills';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Skills not found';
                errorMsg = notFound(addError);                  
            }


            match = other.match(/Feats:\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Feats:\s*/,'');
                attributeName = 'npcfeats';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Feats not found';
                errorMsg = notFound(addError);                  
            }



            match = other.match(/Challenge Rating:\s*([\d]+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Challenge Rating:\s*/,'');
                attributeName = 'npccr';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'CR not found';
                errorMsg = notFound(addError);                  
            }
            
            
            match = other.match(/Special Attacks:\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Special Attacks:\s*/,'');
                attributeName = 'npcspecialattacks';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Special Attacks not found';
                errorMsg = notFound(addError);                  
            }            


            match = other.match(/Special Qualities:\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Special Qualities:\s*/,'');
                attributeName = 'npcspecialqualities';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Special Qualities not found';
                errorMsg = notFound(addError);                  
            }  


            
            match = other.match(/Attack:\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Attack:\s*/,'');
                attributeName = 'npcattack';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Single Attack not found';
                errorMsg = notFound(addError);                  
            }
            
            
            match = other.match(/Full Attack:\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Full Attack:\s*/,'');
                attributeName = 'npcfullattack';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Full Attack not found';
                errorMsg = notFound(addError);                  
            }
            
            
            match = other.match(/Environment:\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Environment:\s*/,'');
                attributeName = 'npcenv';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Environment not found';
                errorMsg = notFound(addError);                  
            }             
            

            match = other.match(/Organization:\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Organization:\s*/,'');
                attributeName = 'npcorg';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Organization not found';
                errorMsg = notFound(addError);                  
            }
            
            
            match = other.match(/Treasure:\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Treasure:\s*/,'');
                attributeName = 'npctreasure';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Treasure not found';
                errorMsg = notFound(addError);                  
            }
            
            
            match = other.match(/Alignment:\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Alignment:\s*/,'');
                attributeName = 'npcalignment';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Alignment not found';
                errorMsg = notFound(addError);                  
            }            
            


            match = other.match(/Advancement:\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Advancement:\s*/,'');
                attributeName = 'npcadv';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Advancement not found';
                errorMsg = notFound(addError);                  
            }


            match = other.match(/Level Adjustment:\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Level Adjustment:\s*/,'');
                attributeName = 'npclvladj';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Level Adjustment not found';
                errorMsg = notFound(addError);                  
            }
            
            


            match = other.match(/Space\/Reach:\s*[\d]+ ft.\/[\d]+ ft./ig);
            if (match){
                var regex = match[0];
                regex = regex.replace(/Space\/Reach:\s*/,'');
                regex = regex.split('/');
                let space = regex[0];
                let reach = regex[1];
                attributeName = 'npcspace';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current",space);
                attributeName = 'npcreach';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current",reach);                
            } else {
                addError = 'Space/Reach not found';
                errorMsg = notFound(addError);                  
            }
            
            chatAnnounce('&{template:DnD35StdRoll} {{basicflag=true}} {{name=importMonsterAPI }}{{notes=**Importing Monster Complete!**<br><br>-------<br>The following attributes were not found or had errors. Please update manually:<br>-------<br>**' + errorMsg + '**}}');
            //chatAnnounce('<br>Importing Monster Complete!');
            //chatAnnounce('The following attributes were not found or had errors. Please update manually:');
            //chatAnnounce('' + errorMsg);
            
        }
        
        if(msg.type=="api" && msg.content.indexOf("!createskillMacros")==0){        
        

            //Find character "importMonster"
            var importMonster = findObjs({ type: "character", name: "importMonster" });
            importMonster = importMonster[0];        
        
            //create new Array containing the name of each Skill
            const skillName = new Array("Appraise","Balance","Bluff","Climb","Concentrate","Diplomacy","Disguise","Escape Artist","Forgery","Gather Information","Heal","Jump","Hide","Intimidate","Listen","Move Silently","Ride","Search","Sense Motive","Spot","Survival","Swim","Use Rope","Knwl(general)","Craft(general)","Perform(general)");
            const abilityMod = new Array("npcint-mod","npcdex-mod","npccha-mod","npcstr-mod","npccon-mod","npccha-mod","npccha-mod","npcdex-mod","npcint-mod","npccha-mod","npcwis-mod","npcstr-mod","npcdex-mod","npccha-mod","npcwis-mod","npcdex-mod","npcdex-mod","npcint-mod","npcwis-mod","npcwis-mod","npcwis-mod","npcstr-mod","npcdex-mod","npcint-mod","npcint-mod","npccha-mod");
            const skillComplex = new Array("Craft","Knowledge","Perform","Profession");        
            //var other = getAttrByName(importMonster.id, "other");            
            
            
            
            //grab "npcskills" attribute and set as skillText
            var skillsText = getAttrByName(importMonster.id, "npcskills");
            //skillsText = other;
            
            
            //sendChat('importMonster',skillName.length);
            //var regexSkill = new String("");
            var skillMatch = new String("");
            //sendChat('importMonster','' + skillName.length);

            
            
            //create for statement to .match all skills.
            for (i = 0; i < skillName.length; i++) {

                
                //create Regex expression for .match using each skill name
                skillnameText = skillName[i];
                regex = "" + skillnameText + "\\s\\+[\\d]+";
                regexSkill = new RegExp(regex,'ig');
                skillMatch = skillsText.match(regexSkill);
                if (skillMatch){
                    skillMatch = skillMatch[0];
                    //These lines are to capture additional text after the listed skill in "(text)"
                    regex = "" + skillnameText + "\\s\\+[\\d]+\\s\\(\\+[\\d]+[a-zA-Z0-9 ]+\\)";
                    regexSkill = new RegExp(regex,'ig');
                    skillText = skillsText.match(regexSkill);
                    if (skillText){
                        skillText = skillText[0];
                    }
                }
                
                //sendChat results
                if (skillMatch){
                    
                    sendChat('importMonster','' + skillMatch);
                    let skillMod = skillMatch.split('+')[1];
                    skillMod = skillMod.replace('(','[');
                    skillMod = skillMod.replace(')',']');
                    sendChat('importMonster','' + skillMod);
                    
                    let actionMacro = "&{template:DnD35StdRoll} {{basicflag=true}} {{name=@{character_name} }} {{" + skillnameText + ": [[1d20+" + skillMod + "]]}}";
                    if (skillText){
                        actionMacro = actionMacro + "{{notes=" + skillText + "}}";
                    }
                    let nameMacro = "z" + skillnameText.replace(' ','');
                    createnewMacro(nameMacro,actionMacro);
                
                    
                } else {
                    
                    let skillMod = getAttrByName(importMonster.id, abilityMod[i]);                    
                    let actionMacro = "&{template:DnD35StdRoll} {{basicflag=true}} {{name=@{character_name} }} {{" + skillnameText + ": [[1d20+" + skillMod + "]]}}";
                    let nameMacro = "z" + skillnameText.replace(' ','');
                    createnewMacro(nameMacro,actionMacro);
                    
                }
                
                
                //sendChat('immportMonster','asdf ' + regexSkill);
                    
                //let skillMatchTwo = other.match(/Hide\s\+[\d]*/ig);
                //sendChat('importMonster',skillMatchTwo[0]);
                    
            }        
            
            


            //Trained Only Skills
            const skillNameTrained = new Array("Decipher Script","Disable Device","Handle Animal","Open Lock","Sleight of Hand","Spellcraft","Tumble","Use Magic Device");
            const abilityModTrained = new Array("npcint-mod","npcint-mod","npccha-mod","npcdex-mod","npcdex-mod","npcint-mod","npcdex-mod","npccha-mod");
            for (i = 0; i < skillName.length; i++) {

                
                //create Regex expression for .match using each skill name
                skillnameText = skillNameTrained[i];
                regex = "" + skillnameText + "\\s\\+[\\d]*";
                regexSkill = new RegExp(regex,'ig');
                skillMatch = skillsText.match(regexSkill);
                if (skillMatch){
                    skillMatch = skillMatch[0];
                    //These lines are to capture additional text after the listed skill in "(text)"
                    regex = "" + skillnameText + "\\s\\+[\\d]+\\s\\(\\+[\\d]+[a-zA-Z0-9 ]+\\)";
                    regexSkill = new RegExp(regex,'ig');
                    skillText = skillsText.match(regexSkill);
                    if (skillText){
                        skillText = skillText[0];
                    }
                }
                
                //sendChat results
                if (skillMatch){
                    
                    sendChat('importMonster','' + skillMatch);
                    let skillMod = skillMatch.split('+')[1];
                    skillMod = skillMod.replace('(','[');
                    skillMod = skillMod.replace(')',']');                    
                    sendChat('importMonster','' + skillMod);
                    let actionMacro = "&{template:DnD35StdRoll} {{basicflag=true}} {{name=@{character_name} }} {{" + skillnameText + ": [[1d20+" + skillMod + "]]}}";
                    if (skillText){
                        actionMacro = actionMacro + "{{notes=" + skillText + "}}";
                    }
                    let nameMacro = "z" + skillnameText.replace(' ','');
                    createnewMacro(nameMacro,actionMacro);
                
                    
                }
            }    
                //Knowledge
                skillMatch = skillsText.match(/Knowledge \(([a-zA-Z0-9 ]+)\) \+[\d]+/ig);
                if (skillMatch){
                    for (i=0; i < skillMatch.length; i++){
                        let skillMatchComp = skillMatch[i];
                        let skillnameText = skillMatchComp.split('+')[0];
                        let skillMod = skillMatchComp.split('+')[1];
                        skillMod = skillMod.replace('(','[');
                        skillMod = skillMod.replace(')',']');
                        let nameMacro = "z" + skillnameText.replace(' ','');
                        let actionMacro = "&{template:DnD35StdRoll} {{basicflag=true}} {{name=@{character_name} }} {{" + skillnameText + ": [[1d20+" + skillMod + "]]}}";
                        createnewMacro(nameMacro,actionMacro);
                        
                    }
                }
                
                skillMatch = skillsText.match(/Craft \(([a-zA-Z0-9 ]+)\) \+[\d]+/ig);
                if (skillMatch){
                    for (i=0; i < skillMatch.length; i++){
                        let skillMatchComp = skillMatch[i];
                        let skillnameText = skillMatchComp.split('+')[0];
                        let skillMod = skillMatchComp.split('+')[1];
                        skillMod = skillMod.replace('(','[');
                        skillMod = skillMod.replace(')',']');
                        let nameMacro = "z" + skillnameText.replace(' ','');
                        let actionMacro = "&{template:DnD35StdRoll} {{basicflag=true}} {{name=@{character_name} }} {{" + skillnameText + ": [[1d20+" + skillMod + "]]}}";
                        createnewMacro(nameMacro,actionMacro);
                        
                    }
                }
                
                
                skillMatch = skillsText.match(/Profession \(([a-zA-Z0-9 ]+)\) \+[\d]+/ig);
                if (skillMatch){
                    for (i=0; i < skillMatch.length; i++){
                        let skillMatchComp = skillMatch[i];
                        let skillnameText = skillMatchComp.split('+')[0];
                        let skillMod = skillMatchComp.split('+')[1];
                        skillMod = skillMod.replace('(','[');
                        skillMod = skillMod.replace(')',']');                        
                        let nameMacro = "z" + skillnameText.replace(' ','');
                        let actionMacro = "&{template:DnD35StdRoll} {{basicflag=true}} {{name=@{character_name} }} {{" + skillnameText + ": [[1d20+" + skillMod + "]]}}";
                        createnewMacro(nameMacro,actionMacro);
                        
                    }
                }
                
                
                skillMatch = skillsText.match(/Perform \(([a-zA-Z0-9 ]+)\) \+[\d]+/ig);
                if (skillMatch){
                    for (i=0; i < skillMatch.length; i++){
                        let skillMatchComp = skillMatch[i];
                        let skillnameText = skillMatchComp.split('+')[0];
                        let skillMod = skillMatchComp.split('+')[1];
                        skillMod = skillMod.replace('(','[');
                        skillMod = skillMod.replace(')',']');                        
                        let nameMacro = "z" + skillnameText.replace(' ','');
                        let actionMacro = "&{template:DnD35StdRoll} {{basicflag=true}} {{name=@{character_name} }} {{" + skillnameText + ": [[1d20+" + skillMod + "]]}}";
                        createnewMacro(nameMacro,actionMacro);
                        
                    }
                }                  
                
                
                
                
                //sendChat('immportMonster','asdf ' + regexSkill);
                    
                //let skillMatchTwo = other.match(/Hide\s\+[\d]*/ig);
                //sendChat('importMonster',skillMatchTwo[0]);
                    
            









      
                
        
        } 
        
        
        
        
        //Huge greataxe +18/+13 melee (3d6+13/x3) or 2 slams +18 melee (1d4+9) or rock +9 ranged (2d6+9)
        
        
        
        //If !createattackMacros, use npcattack and npcfullattack to create attack macros
        if(msg.type=="api" && msg.content.indexOf("!createattackMacros")==0){

            var importMonster = findObjs({ type: "character", name: "importMonster" });
            importMonster = importMonster[0];
            
            var attackText = getAttrByName(importMonster.id, "npcattack");
            var fullattackText = getAttrByName(importMonster.id, "npcfullattack");
            
            attackText = attackText.split(/ or /);
            fullattackText = fullattackText.split(/ or /);
            
            notes = "";
            //Greataxe +18 melee (3d6+13/x3) or slam +18 melee (1d4+9) or rock +9 ranged (2d6+9)
            for (i = 0; i < attackText.length; i++){
                var text = attackText[i];
                name = text.match(/(.*)\s[+-]/)[0];
                name = name.replace(/\s[+-]/,'');
                attackMod = text.match(/(.*)\s[+-][\d]+/)[0];
                attackMod = attackMod.replace(/(.*)\s[+-]/,'');
                attackDmg = text.match(/[\d]+d[\d]+[+-][\d]+/);
                if (attackDmg){
                    attackDmg = attackDmg[0];
                
                //Sets up a series of conditions on which it finds #d#+# for damage
                //If nothing is found, it searches for #d# instead.
                //If nothing is found still, it searches instead for "(text)".
                //If nothing is found still, it defaults to 0 with the label "couldn't Find"
                } else {
                    attackDmg = text.match(/[\d]+d[\d]+/);
                    if (attackDmg){
                        attackDmg = attackDmg[0];
                    } else {
                        attackDmg = text.match(/\((.*)\)/);
                        if (attackDmg) {
                            attackDmg = attackDmg[0];
                            notes = notes + name + ": " + attackDmg + "<br>";
                            attackDmg = attackDmg.replace('(','');
                            attackDmg = attackDmg.replace(')','');
                            attackDmg = "0 [" + attackDmg + "]";
                        } else {
                            attackDmg = "0 [Couldn't Find]";
                        }
                
                    }    
                } 
                critRange = text.match(/\/[\d]+-[\d]+/);
                if (critRange){
                    critRange = critRange[0];
                    critRange = critRange.replace('/','');
                    critRange = critRange.replace(/-[\d]+/,'');
                } else {
                    critRange = '20';
                }
                critMult = text.match(/x[\d]\)/);
                if (critMult){
                    critMult = critMult[0];
                    critMult = critMult.replace('x','');
                    critMult = critMult.replace(')','');
                } else {
                    critMult = "2";
                }
                let action = "&{template:DnD35Attack} {{basicflag=true}} {{name=@{npcname} }} {{subtags=attacks with a [" + name + "] }} {{attack1=" + name + ": [[1d20cs>" + critRange + " + " + attackMod + " + ?{Attack Mod?|0} [Atk Mod] ]] }} {{critconfirm1=Crit?: [[1d20cs>" + critRange + " + " + attackMod + " + ?{Attack Mod?|0} [Atk Mod] ]] }} {{damage1=for [[" + attackDmg + " + ?{Damage Mod?|0} [Dmg Mod] ]] dmg}} {{critdmg1=+ [[(" + critMult + "-1)*(" + attackDmg + " + ?{Damage Mod?|0} [Dmg Mod]) ]] crit dmg}}";
                action = action + "{{notes=" + notes + "}}";
                createnewMacro(name,action);
            
            }
            
            
            
            
            
            
            
            
            //Huge greataxe +18/+13 melee (3d6+13/x3) or 2 slams +18 melee (1d4+9) or rock +9 ranged (2d6+9)
            //Huge greataxe +18/+13 melee (3d6+13/x3) [0]
            //2 slams +18 melee (1d4+9) [1]
            //rock +9 ranged (2d6+9) [2]
            //for each set separated by /or/
            sendChat('gm','' + fullattackText);
            for (i = 0; i < fullattackText.length; i++){
                var text = fullattackText[i];
                text = text.split(/ and /);
                sendChat('gm','' + text);
                var action = "&{template:DnD35Attack} {{basicflag=true}} {{name=@{npcname} }} {{subtags=attacks with a [Full Attack!] }} {{fullattackflag= [[ d1 ]] }}";
                //for each attack separated by /and/
                
                attackNum = 1;
                var notesFA = "";
                for (j=0; j < text.length; j++){
                    //defines what attack number we are in for macro
                    let textFA = text[j];
                    sendChat('gm','' + textFA);
                    var name = textFA.match(/(.*)\s[+-]/)[0];
                    name = name.replace(/\s[+-]/,'');
                    let multiattackFlag = 0;
                    var attackMod = textFA.match(/(.*)\s(?<atkmod>[+-][\d]+\/*[+-[\d]+]*\/*[+-[\d]+]*\/*[+-[\d]+]*)/);
                    if (attackMod){
                    attackMod = attackMod.groups.atkmod;
                    attackMod = attackMod.replace(/[+-]/,'');
                    attackMod = attackMod.split('/');
                    multiattackFlag = 1;
                    } else {
                        attackMod = textFA.match(/\s[+-][\d]+/)[0];
                        attackMod = attackMod.replace(/ [+-]/,'');
                    }
                    var attackDmg = textFA.match(/[\d]+d[\d]+[+-][\d]+/);
                    if (attackDmg){
                        attackDmg = attackDmg[0];
                
                    //Sets up a series of conditions on which it finds #d#+# for damage
                    //If nothing is found, it searches for #d# instead.
                    //If nothing is found still, it searches instead for "(text)".
                    //If nothing is found still, it defaults to 0 with the label "couldn't Find"
                    } else {
                        attackDmg = textFA.match(/[\d]+d[\d]+/);
                        if (attackDmg){
                            attackDmg = attackDmg[0];
                        } else {
                            attackDmg = textFA.match(/\((.*)\)/);
                            if (attackDmg) {
                            attackDmg = attackDmg[0];
                            notesFA = notesFA + name + ": " + attackDmg + "<br>";
                            attackDmg = attackDmg.replace('(','');
                            attackDmg = attackDmg.replace(')','');
                            attackDmg = "0 [" + attackDmg + "]";
                            } else {
                                attackDmg = "0 [Couldn't Find]";
                            }
                
                        }    
                    }
                    let critRange = textFA.match(/\/[\d]+-[\d]+/);
                    if (critRange){
                        critRange = critRange[0];
                        critRange = critRange.replace('/','');
                        critRange = critRange.replace(/-[\d]+/,'');
                    } else {
                        critRange = '20';
                    }
                    let critMult = textFA.match(/x[\d]\)/);
                    if (critMult){
                        critMult = critMult[0];
                        critMult = critMult.replace('x','');
                        critMult = critMult.replace(')','');
                    } else {
                        critMult = "2";
                    }
                    //If +#/+#/+#/+#
                    //attackMod.length > 1
                    if (multiattackFlag) { 
                        for (k=0; k < attackMod.length; k++){
                        action = action + "{{attack" + attackNum + "=" + name + attackNum + ": [[1d20cs>" + critRange + " + " + attackMod[k] + " + ?{Attack Mod?|0} [Atk Mod] ]] }} {{critconfirm" + attackNum + "=Crit?: [[1d20cs>" + critRange + " + " + attackMod[k] + " + ?{Attack Mod?|0} [Atk Mod] ]] }} {{damage" + attackNum + "=for [[" + attackDmg + " + ?{Damage Mod?|0} [Dmg Mod] ]] dmg}} {{critdmg" + attackNum + "=+ [[(" + critMult + "-1)*(" + attackDmg + " + ?{Damage Mod?|0} [Dmg Mod]) ]] crit dmg}}";
                        attackNum++;    
                        }
                    //if "2 claws" or "2 slams"
                    } else if (name.match(/[\d]\s(.*)/)) { 
                        //defines the number of attacks for this part of macro building.
                        numAttacks = name.split(' ')[0]; 
                        numAttacks = parseInt(numAttacks,10);
                        for (k=0; k < numAttacks; k++){
                        action = action + "{{attack" + attackNum + "=" + name + attackNum + ": [[1d20cs>" + critRange + " + " + attackMod + " + ?{Attack Mod?|0} [Atk Mod] ]] }} {{critconfirm" + attackNum + "=Crit?: [[1d20cs>" + critRange + " + " + attackMod + " + ?{Attack Mod?|0} [Atk Mod] ]] }} {{damage" + attackNum + "=for [[" + attackDmg + " + ?{Damage Mod?|0} [Dmg Mod] ]] dmg}} {{critdmg" + attackNum + "=+ [[(" + critMult + "-1)*(" + attackDmg + " + ?{Damage Mod?|0} [Dmg Mod]) ]] crit dmg}}";
                        attackNum++;    
                        }
                    //if a single attack only    
                    } else { 
                        action = action + "{{attack" + attackNum + "=" + name + attackNum + ": [[1d20cs>" + critRange + " + " + attackMod + " + ?{Attack Mod?|0} [Atk Mod] ]] }} {{critconfirm" + attackNum + "=Crit?: [[1d20cs>" + critRange + " + " + attackMod + " + ?{Attack Mod?|0} [Atk Mod] ]] }} {{damage" + attackNum + "=for [[" + attackDmg + " + ?{Damage Mod?|0} [Dmg Mod] ]] dmg}} {{critdmg" + attackNum + "=+ [[(" + critMult + "-1)*(" + attackDmg + " + ?{Damage Mod?|0} [Dmg Mod]) ]] crit dmg}}";
                        attackNum++;    
                    }
                    
                }
                action = action + "{{notes=" + notesFA + "}}";
                createnewMacro("full"+i,action);
            //end of fullattack for statement    
            } 

            

            
        //end of !createattackMacros
        } 
        
        
        
        
//If !deleteMacros, find each macro and delete it for character importMonster
        if(msg.type=="api" && msg.content.indexOf("!deleteMacros")==0){

            var importMonster = findObjs({ type: "character", name: "importMonster" });
            importMonster = importMonster[0];


            
            var existingMacros = findObjs({
                type:"ability",
                characterid:importMonster.id
                
            });
            //sendChat('deleteMacros',existingMacros);
            //sendChat('deleteMacros',importMonster.id);
            if (existingMacros!==undefined){
                _.each(existingMacros,function(abil){
                    abil.remove();
                })
            }
            
            

        }        
        
        
        
        
        
        
        
        
        
        
        
        function createnewMacro(name,action) {
            createObj("ability", {
                name: name,
                characterid: importMonster.id,
                action: action,
                istokenaction: true
            });        
        
        }
        
        
      
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
    });
});
