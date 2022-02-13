//Import Monster stats into 3.5 Character Sheet (Diana P).
//Create a new character named "importMonster"

//Copy SRD info and put into "other" field of PC character sheet
//It is recommended that you copy your text as "plain text"

//Make sure that any related information is on the same line
//For example, make sure that the list of skills does not contain a line break
//until after the list has ended

//Use !importMonster to import monster information
//Make adjustments to the text as needed.

//Use !createabilityMacros to generate a macro containing each ability description
//Format is Name (Ex|Sp|Su) <line break> Description
//Any damage or otherwise is not included in this macro and must be made manually.

//For all commands that create macros, these commands add to the macro list and
//Never remove any existing macros. Therefore, the command !deleteMacros has been
//included. This command !!!DELETES ALL MACROS!!! for character importMonster.
//If you only want to delete some macros, you need to delete them manually.
//No other Macros or character sheets are affected by this command.

//Written by Anthony Stuertzel, based on the code by Chris S.
//Here's the website for the Wolf SRD I used to test everything:
//https://www.d20srd.org/srd/monsters/wolf.htm

//Command !shortblockMonster
//If you're copying from a shorter block from a book, use the shortblockMonster
//script instead. It is specifically designed around these truncated stat blocks.

//Command !deleteMacros deletes all macros for creature "importMonster"
//Command !createskillMacros adds macros for each skill, parsing the information from the Skills line of NPC character sheet for character "importMonster"

//Command !createattackMacros adds Single Attacks and Full Attacks from the npcattack and npcfullattack field
//Note: this is designed around normal attacks that have an attack roll and damage.
//It parses "and" and "or" to figure out how to make the macros.
//Proper format for attacks <name> <+ or -><number> (<num>d<num>+<num>)
//The damage is in the parantheses; however, the script will also accept
//#d# or plain text for damage.

on("ready",function(){
    on("chat:message",function(msg){
        if((msg.type=="api" && msg.content.indexOf("!importMonster")==0) || (msg.type=="api" && msg.content.indexOf("!createabilityMacros")==0) || (msg.type=="api" && msg.content.indexOf("!createskillMacros")==0) || (msg.type=="api" && msg.content.indexOf("!createattackMacros")==0) || (msg.type=="api" && msg.content.indexOf("!deleteMacros")==0 || (msg.type=="api" && msg.content.indexOf("!shortblockMonster")==0)))
        { //if any of the commands in this script are used, define commonly used functions and variables
        
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
            
            
            function createnewMacro(name,action) {
                createObj("ability", {
                    name: name,
                    characterid: importMonster.id,
                    action: action,
                    istokenaction: true
                });        
            
            }            
        
        
        }
        
        
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
        
        
        
        if(msg.type=="api" && msg.content.indexOf("!importMonster")==0){
            
            //Renames labels in field "other" for simplified monster statblocks
            //Checks that text contains the words "Short Block"
            //Add "Size/Type:" before creature size/type manually


            
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

            
            match = other.match(/(?:Size\/Type:)?\s*(fine|diminutive|tiny|small|medium|large|huge|gargantuan|colossal) ([a-zA-Z0-9 \(\)]+)/ig);
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
            
            
            
            match = other.match(/Speed:\s*(.*)/ig);
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


            
            match = other.match(/\nAttack:\s*(.+)\n/ig); //uses \n to indicate the start of a line ^ and $ do not work
            if(match){
                var regex = match[0];
                regex = regex.replace(/\n/,'');
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
            
            
            match = other.split('\n'); //separate by line
            nameError = match[0].match(/Size\/Type:/ig); //checks to see if first line is Size/Type field
            if (!nameError){
                nameError = match[0].match(/Hit Dice:/ig); //checks to see if first line is Hit Dice (in case Size/Type is missing)
                if (!nameError) { //If first line is not Size/Type or Hit Dice, assumes that first line is npcname
                var regex = match[0];
                regex = regex.replace(/Hit Dice:/,'');
                attributeName = 'npcname';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current",regex);
                } else {
                addError = 'Name not found';
                errorMsg = notFound(addError);                     
                }
            } else {
                addError = 'Name not found';
                errorMsg = notFound(addError);                  
            }
            

            chatAnnounce('&{template:DnD35StdRoll} {{basicflag=true}} {{name=importMonsterAPI }}{{notes=**Importing Monster Complete!**<br><br>-------<br>The following attributes were not found or had errors. Please update manually:<br>-------<br>**' + errorMsg + '**}}');


        }
        if(msg.type=="api" && msg.content.indexOf("!createabilityMacros")==0){
            
            //creates macros for each ability with Ex, Sp, or Su in parantheses
            //each ability description must be on a new line
            match = other.match(/([a-zA-Z0-9 ]+)\((Ex|Sp|Su)\)\n(.*)/ig); //checks for a line with text followed by (ex,sp,su) then text
            if (match){
                for (i=0; i < match.length; i++) {
                    var regex = match[i];
                    regex = regex.split(/\n/);
                    name = regex[0];
                    name = name.replace(' ','');
                    description = match[i];
                    let actionMacro = "&{template:DnD35StdRoll} {{basicflag=true}} {{name=@{character_name} }} {{notes=" + description + "}}";
                    let nameMacro = name;
                    nameMacro = name.replace(' ','');
                    createnewMacro(nameMacro,actionMacro);
                    addError = nameMacro;
                    errorMsg = notFound(addError);                         
                }
            } else {
                addError = '<br>No abilities found<br>Abilities format:<br>Name (Ex|Sp|Su)<br>(description)<br>(line break required)';
                errorMsg = notFound(addError);                  
            }            
            
            
            chatAnnounce('&{template:DnD35StdRoll} {{basicflag=true}} {{name=importMonsterAPI }}{{notes=**Ability Macros Created!**<br><br>-------<br>The following ability macros were created:<br>-------<br>**' + errorMsg + '**}}');            
        
        
        
        } 
        
        
        
        if(msg.type=="api" && msg.content.indexOf("!createskillMacros")==0){        
        

            //create new Array containing the name of each Skill
            const skillName = new Array("Appraise","Balance","Bluff","Climb","Concentrate","Diplomacy","Disguise","Escape Artist","Forgery","Gather Information","Heal","Jump","Hide","Intimidate","Listen","Move Silently","Ride","Search","Sense Motive","Spot","Survival","Swim","Use Rope","Knwl(general)","Craft(general)","Perform(general)");
            const abilityMod = new Array("npcint-mod","npcdex-mod","npccha-mod","npcstr-mod","npccon-mod","npccha-mod","npccha-mod","npcdex-mod","npcint-mod","npccha-mod","npcwis-mod","npcstr-mod","npcdex-mod","npccha-mod","npcwis-mod","npcdex-mod","npcdex-mod","npcint-mod","npcwis-mod","npcwis-mod","npcwis-mod","npcstr-mod","npcdex-mod","npcint-mod","npcint-mod","npccha-mod");
            const skillComplex = new Array("Craft","Knowledge","Perform","Profession");        
            //var other = getAttrByName(importMonster.id, "other");            

            //grab "npcskills" attribute and set as skillText
            var skillsText = getAttrByName(importMonster.id, "npcskills");
            var skillMatch = new String("");

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
                
                if (skillMatch){
                    
                    addError = skillMatch;
                    errorMsg = notFound(addError);                    
                    let skillMod = skillMatch.split('+')[1];
                    skillMod = skillMod.replace('(','[');
                    skillMod = skillMod.replace(')',']');

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
                    
                    addError = skillMatch;
                    errorMsg = notFound(addError); 
                    let skillMod = skillMatch.split('+')[1];
                    skillMod = skillMod.replace('(','[');
                    skillMod = skillMod.replace(')',']');                    
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
                        addError = skillMatchComp;
                        errorMsg = notFound(addError);                          
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
                        addError = skillMatchComp;
                        errorMsg = notFound(addError);                        
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
                        addError = skillMatchComp;
                        errorMsg = notFound(addError);                        
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
                        addError = skillMatchComp;
                        errorMsg = notFound(addError);                        
                        let skillnameText = skillMatchComp.split('+')[0];
                        let skillMod = skillMatchComp.split('+')[1];
                        skillMod = skillMod.replace('(','[');
                        skillMod = skillMod.replace(')',']');                        
                        let nameMacro = "z" + skillnameText.replace(' ','');
                        let actionMacro = "&{template:DnD35StdRoll} {{basicflag=true}} {{name=@{character_name} }} {{" + skillnameText + ": [[1d20+" + skillMod + "]]}}";
                        createnewMacro(nameMacro,actionMacro);
                        
                    }
                }                  
                
            chatAnnounce('&{template:DnD35StdRoll} {{basicflag=true}} {{name=importMonsterAPI }}{{notes=**Skill Macros Created!**<br><br>-------<br>The following skills macros have been created:<br>-------<br>**' + errorMsg + '**}}');            
                

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
                name = text.match(/(.*)\s[+-]/);
                if (name){
                    name = name[0];
                } else {
                    sendChat('GM',"could not find attack name.<br>This error can occur if 'and' or 'or' are used anywhere but in the separation of different attacks. If these words appear in the damage description or elsewhere, place an astrerick around it, change it, or alter it in some way. Otherwise, see the comments section for insight on the proper structure of attacks for this code.");
                    return;
                }                
                name = name.replace(/\s[+-]/,'');
                attackMod = text.match(/(.*)\s[+-][\d]+/);
                if (attackMod) {
                    attackMod = attackMod[0];
                } else {
                    sendChat('GM','Could not find attack mod for attack named' + name + ' for Standard Attack. Please check that attack is in correct format<br><br>Format:<br>Name +Modifier (Damage)');
                    return;
                }                
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
                addError = name;
                errorMsg = notFound(addError);                
            
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
                    var name = textFA.match(/(.*)\s[+-]/);
                    if (name){
                        name = name[0];
                    } else {
                        sendChat('GM',"could not find attack name.<br>This error can occur if 'and' or 'or' are used anywhere but in the separation of different attacks. If these words appear in the damage description or elsewhere, place an astrerick around it, change it, or alter it in some way. Otherwise, see the comments section for insight on the proper structure of attacks for this code.");
                        return;
                    }                       
                    name = name.replace(/\s[+-]/,'');
                    let multiattackFlag = 0;
                    var attackMod = textFA.match(/(.*)\s(?<atkmod>[+-][\d]+\/*[+-[\d]+]*\/*[+-[\d]+]*\/*[+-[\d]+]*)/);
                    if (attackMod){
                    attackMod = attackMod.groups.atkmod;
                    attackMod = attackMod.replace(/[+-]/,'');
                    attackMod = attackMod.split('/');
                    multiattackFlag = 1;
                    } else {
                        attackMod = textFA.match(/\s[+-][\d]+/);
                        if (attackMod) {
                            attackMod = attackMod[0];
                        } else {
                            sendChat('GM','Could not find attack mod for attack named ' + name + ' for Full Attack. Please check that attack is in correct format<br><br>Format:<br>Name +Modifier (Damage)');
                            return;
                        }
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
                addError = "full"+i;
                errorMsg = notFound(addError);                 
            //end of fullattack for statement    
            } 

            chatAnnounce('&{template:DnD35StdRoll} {{basicflag=true}} {{name=importMonsterAPI }}{{notes=**Attack Macros Created!**<br><br>-------<br>The following attack macros have been created:<br>-------<br>**' + errorMsg + '**}}');            
            

            
        //end of !createattackMacros
        } 
        
        
        
        
//If !deleteMacros, find each macro and delete it for character importMonster
        if(msg.type=="api" && msg.content.indexOf("!deleteMacros")==0){


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
            
            chatAnnounce('&{template:DnD35StdRoll} {{basicflag=true}} {{name=importMonsterAPI }}{{notes=**All Macros Deleted for character named importMonster!**}}');            
            

        }
        
        
        
        if(msg.type=="api" && msg.content.indexOf("!shortblockMonster")==0){
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
            
            
            match = other.match(/(?:Size\/Type:)?\s*(fine|diminutive|tiny|small|medium|large|huge|gargantuan|colossal) ([a-zA-Z0-9 \(\)]+)/ig);
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
            


            match = other.match(/AC\s*([\d]+)/ig);
            //If armorclass is found, update attribute, else error message.
            if(match){
                var regex = match[0];
                regex = regex.split(' ')[1];
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
            
            
            match = other.match(/\([\d]+\sHD\)/ig);
            if(match){
                var regex = match[0];
                regex = regex.split(' ')[0];
                attributeName = 'npchitdie';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);
            } else {
                addError = 'Hit Dice not found';
                errorMsg = notFound(addError);                  
            }            


            match = other.match(/hp [\d]+/ig);
            if(match){
                var regex = match[0];
                regex = regex.split(' ')[1];
                attributeName = 'npchitpoints';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);
                foundAttribute.set("max",regex);
            } else {
                addError = 'HP not found';
                errorMsg = notFound(addError);                  
            }
            
            
            //Base Atk +3; Grp –1
            match = other.match(/Base Atk\s*[+-][\d]+/ig);
            if(match){
                var regex = match[0];
                regex = regex.split(/\s/);
                baseAtt = regex[2];
                attributeName = 'npcbaseatt';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", baseAtt); 
            } else {
                addError = 'Base Attack not found';
                errorMsg = notFound(addError);                  
            }       
            
            
            
            match = other.match(/Grp\s*[+-][\d]+/ig);
            if(match){
                var regex = match[0];
                regex = regex.split(/\s/);
                grapple = regex[1];
                attributeName = 'npcgrapple';
    			foundAttribute = findAttribute(attributeName);
    			foundAttribute.set("current",grapple);
            } else {
                addError = 'Grapple not found';
                errorMsg = notFound(addError);                  
            }           
            
            
            match = other.match(/Init\s[+-][\d]+/ig);
            if(match){
                var regex = match[0];
                regex = regex.split(/[+-]/)[1];
                attributeName = 'npcinit';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);
            } else {
                addError = 'Initiative not found';
                errorMsg = notFound(addError);                  
            }
            
            match = other.match(/Speed\s*(.*)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Speed\s*/,'');
                attributeName = 'npcspeed';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Speed not found';
                errorMsg = notFound(addError);                  
            }
            
            
            match = other.match(/Skills\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Skills\s*/,'');
                attributeName = 'npcskills';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Skills not found';
                errorMsg = notFound(addError);                  
            }
            
            match = other.match(/Feats\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Feats\s*/,'');
                attributeName = 'npcfeats';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Feats not found';
                errorMsg = notFound(addError);                  
            }
            
            match = other.match(/CR\s*([\d]+)/g);
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
            
            
            match = other.match(/Special Actions\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Special Actions\s*/,'');
                var specialActions = regex;
                attributeName = 'npcspecialattacks';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Special Attacks not found';
                errorMsg = notFound(addError);
                var specialActions = '';
            }
            
            match = other.match(/Atk Options\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Atk Options\s*/,'');
                regex = regex + ", " + specialActions;
            } else {
                regex = specialActions;
            }
            attributeName = 'npcspecialattacks';
    		foundAttribute = findAttribute(attributeName);
            foundAttribute.set("current", regex);               

            
            
            match = other.match(/SQ\s*(.+)/g);
            if(match){
                var regex = match[0];
                regex = regex.replace(/SQ\s*/,'');
                attributeName = 'npcspecialqualities';
    			foundAttribute = findAttribute(attributeName);
                foundAttribute.set("current", regex);                
            } else {
                addError = 'Special Qualities not found';
                errorMsg = notFound(addError);                  
            }              


            match = other.match(/Melee\s*(.+)/ig);
            regex = "";
            melee = "";
            ranged = "";
            if(match){
                Melee = match[0].replace('Melee','');
            } else {
                addError = 'Melee Attack not found';
                errorMsg = notFound(addError);                  
            }                 
            match = other.match(/Ranged\s*(.+)/ig);
            if(match){
                Ranged = match[0].replace('Ranged','');
            } else {
                addError = 'Ranged Attack not found';
                errorMsg = notFound(addError);                  
            }                
            attributeName = 'npcattack';
    		foundAttribute = findAttribute(attributeName);
    		if (melee){
    		    if (ranged){
    		    regex = melee + ' or ' + ranged;
    		    } else {
    		        regex = melee;
    		    }
    		} else {
    		    if (ranged){
    		        regex = ranged;
    		    } else {
                    addError = 'No Attacks found';
                    errorMsg = notFound(addError);    
    		    }
    		}
            foundAttribute.set("current", regex);
            //Full Attack should be the same as Single Attack because Full Attack is all that is listed
            attributeName = 'npcfullattack';
    		foundAttribute = findAttribute(attributeName);
            foundAttribute.set("current", regex);
            
            
            match = other.match(/Combat\sGear\s*(.+)/ig);
            if(match){
                var regex = match[0];
                attributeName = 'npcdescr';
    		    foundAttribute = findAttribute(attributeName);
    		    regex = "Combat Gear: " + regex;
                foundAttribute.set("current",regex);
            } else {
                addError = 'Combat Gear not found';
                errorMsg = notFound(addError);                  
            }  
            
            
            match = other.match(/Hook\s*(.+)/ig);
            if(match){
                var regex = regex + "\n" + match[0];
                attributeName = 'npcdescr';
    		    foundAttribute = findAttribute(attributeName);
                var descr = getAttrByName(importMonster.id, "npcdescr");
                regex = descr + "\nHook:" + regex;
                foundAttribute.set("current",regex);
                
            }
            
            
            match = other.match(/Possessions\s*(.+)/ig);
            if(match){
                var regex = match[0];
                attributeName = 'npcdescr';
    		    foundAttribute = findAttribute(attributeName);
                var descr = getAttrByName(importMonster.id, "npcdescr");
                regex = descr + "\nPosessions: " + regex;
                foundAttribute.set("current",regex);
                
            }            

            match = other.match(/Senses\s*(.+)/g);
            if(match){
                var regex = match[0];
                attributeName = 'npcspecialqualities';
    		    foundAttribute = findAttribute(attributeName);                
                var descr = getAttrByName(importMonster.id, "npcspecialqualities");
                regex = descr + ", " + regex;
                foundAttribute.set("current",regex);            
            
            
            }
            
            match = other.match(/Immune\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Immune\s*/,'');
                attributeName = 'npcdescr';
    		    foundAttribute = findAttribute(attributeName);                 
                var descr = getAttrByName(importMonster.id, "npcdescr");
                regex = descr + "\n" + "Immune: " + regex;
                foundAttribute.set("current",regex);            
            
            
            }
            
            
            
            match = other.match(/Weakness\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Weakness\s*/,'');
                attributeName = 'npcdescr';
    		    foundAttribute = findAttribute(attributeName);                
                var descr = getAttrByName(importMonster.id, "npcdescr");
                regex = descr + "\n" + "Weakness: " + regex;
                foundAttribute.set("current",regex);            
            
            
            }
            
            
            
            match = other.match(/Resist\s*(.+)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/Resist\s*/,'');
                attributeName = 'npcdescr';
    		    foundAttribute = findAttribute(attributeName);                 
                var descr = getAttrByName(importMonster.id, "npcdescr");
                regex = descr + "\n" + "Resist: " + regex;
                foundAttribute.set("current",regex);            
            
            
            }
            
            
            
            match = other.match(/DR\s*[\d]+(.*)/ig);
            if(match){
                var regex = match[0];
                regex = regex.replace(/DR\s*/,'');
                attributeName = 'npcdescr';
    		    foundAttribute = findAttribute(attributeName);                
                var descr = getAttrByName(importMonster.id, "npcdescr");
                regex = descr + "\n" + "DR: " + regex;
                foundAttribute.set("current",regex);            
            
            
            }            
            

            
            
            
        chatAnnounce('&{template:DnD35StdRoll} {{basicflag=true}} {{name=importMonsterAPI }}{{notes=**Importing Monster Complete!**<br><br>-------<br>The following attributes were not found or had errors. Please update manually:<br>-------<br>**' + errorMsg + '**}}');
            
            
        } //End of !shortblockMonster
        
        
        if(msg.type=="api" && msg.content.indexOf("!IM")==0){



            
            sendChat('importMonster','&{template:DnD35StdRoll} {{basicflag=true}} {{name=importMonsterAPI }}{{notes=**importMonster Commands!**<br><br>**!importMonster**<br>Paste the stat block of your monster in "other" on PC section of character sheet before running command. Automatically parses information and updates it on the sheet. Formatted for SRD website monster stat blocks.<br><br>**!shortblockMonster**<br>The same as !importMonster except formatted for short stat blocks found in modules (based on the Red Hand of Doom module).<br><br>**!createattackMacros**<br>Takes the information in Attack and Full Attack on NPC section of character sheet, parses the information and makes each separate Single Attack as well as 1 each of every Full Attack option. Uses "and" and "or" to separate attacks; so if these words appear anywhere else in the attack information, you will be notified of an error. Can parse #d#+#, #d# or plain text for attacks (default #d#+#).<br><br>**!createabilityMacros**<br>Simple script to find abilities listed with (EX), (SP), or (SU). Creates a separate macro for each that places the text in the notes section of the macro. It is recommended that you customize your macro afterwards for better results.<br><br>**!createskillMacros**<br>Uses the skills field of the NPC character sheet to check for bonuses to skills. All listed skills have a macro generated. "Trained Only" skills only have macros generated if they are listed. Knowledge (general), Craft (general), and Perform (general) are also automatically generated. For each skill listed, it uses the listed modifier for that skill. Otherwise, it uses the ability score modifiers to create the skill. It also captures text in parantheses.<br><br>**!deleteMacros**<br>Deletes macros for importMonster. This is useful for if you import a monster and then notice afterwards that some of the text is separated by a line break. It is important to note that all related data should all be on a single line, which the exception of abilities which should have one line for the name and a separate line for the description. However, often times (especially when in a hurry), it is easy to just copy and paste the stat block without realizing there is an arbitrary line break in the text. In such a case, it is often easier to wipe out all of the macros and rerun the commands one at a time. Note, this will delete all of the macros for importMonster. So if you have added your own that you want to keep, it may be easier to delete the macros manually.}}');            
            
            
        }             
        

        
        
    });
});
