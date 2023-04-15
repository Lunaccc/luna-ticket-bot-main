const Discord = require("discord.js");
const disbut = require("discord-buttons");
const client = new Discord.Client();
disbut(client);
const ayarlar = require('./ayarlar.json');
const fs = require("fs");
const db = require("orio.db");
const chalk = require("chalk");
const express = require("express");

var prefix = ayarlar.prefix;

client.on("message", async (message) => {
  let client = message.client;
  if (message.author.bot) return;

  let prefix = ayarlar.prefix;

  if (!message.content.startsWith(prefix)) return;
  let command = message.content.split(" ")[0].slice(prefix.length);
  let params = message.content.split(" ").slice(1);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    cmd.run(client, message, params);
  }
});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  console.log(`Toplamda ${files.length} Komut Var!`);
  files.forEach((f) => {
    let props = require(`./komutlar/${f}`);
    console.log(`${props.help.name} İsimli Komut Aktif!`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach((alias) => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = (command) => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach((alias) => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = (command) => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach((alias) => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = (command) => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
client.elevation = message => {
  if (!message.guild) {
      return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};


client.login(process.env.token)



client.on("ready", async () => {
setInterval(async () => {
  if (db.get("csticket")) {
    Object.keys(db.get("csticket")).map(async e => {
const dbdata = db.get("csticket."+e)
      const sunucu = client.guilds.cache.get(dbdata.sunucuID);
      if (!sunucu) {
         db.delete("csticket." + dbdata.sunucuID);
      } else {

        const kanal = sunucu.channels.cache.get(dbdata.kanal);
        if (!kanal) {
          let a = sunucu.channels.cache.find((xxx) => xxx.name === "DESTEK")
          if (a) {
            setTimeout(() => {
            sunucu.channels.cache.filter(cs => cs.parentID === a.id).map(cs => cs.delete().catch(() => {}))
            }, 5000)
            setTimeout(() => {
            a.delete().catch(() => {})
            }, 10000)
          }
          sunucu.owner.send("Ticket Sistemi İçin Ayarlanan **Ticket Kanalı** Bulunamadığı İçin Sistem Kapandı ve Bütün Destek Talepleri Silindi!").catch(() => {})
           db.delete("csticket." + sunucu.id);
        } else {

  
          const data = await kanal.messages.fetch(dbdata.mesajID).catch((e) => {})
          if (!data) {
            let a = sunucu.channels.cache.find((xxx) => xxx.name === "DESTEK")
            if (a) {
              setTimeout(() => {
              sunucu.channels.cache.filter(cs => cs.parentID === a.id).map(cs => cs.delete().catch(() => {}))
              }, 5000)
              setTimeout(() => {
              a.delete().catch(() => {})
              }, 10000)
            }
            sunucu.owner.send("Ticket Sistemi İçin Ayarlanan **Ticket Mesajı** Bulunamadığı İçin Sistem Kapandı ve Bütün Destek Talepleri Silindi!").catch(() => {})
             db.delete("csticket." + sunucu.id);
          } else {
return
          }
        }
      }
    });
  }
}, 5000)
});
client.on("clickButton", async (button) => {
  let member = button.message.guild.members.cache.get(button.clicker.user.id);
 
  if (!member.user.bot) {
    const data = db.get("csticket." + button.message.guild.id);
    if (data) {
      let listedChannels = []
      const csguild = button.message.guild
      let csrol = csguild.roles.cache.get(data.rolID)
      if(csrol){
      let onl;
      csguild.members.cache.forEach(async p => {
        if (p.roles.cache.has(csrol.id)) {
          if(csguild.members.cache.get(p.id).user.presence.status === "idle") onl = ":orange_circle:";
          if(csguild.members.cache.get(p.id).user.presence.status === "dnd") onl = ":red_circle:";
          if(csguild.members.cache.get(p.id).user.presence.status === "online") onl = ":green_circle:";
          if(csguild.members.cache.get(p.id).user.presence.status === "offline") onl = ":white_circle:";

          listedChannels.push(`\`${p.user.tag}` + "` " + onl);
        }
      });
      if (data.mesajID === button.message.id) {
        if (button.id === "dcsticket") {
          var prefix = ayarlar.prefix;
          button.reply.think(true).then(async msj => {
            originm = member
            if(!csguild.channels.cache.find((xx) => xx.name === "DESTEK")) {
              await csguild.channels.create(`DESTEK`, {
                type: "category",
              }).catch(() => {})
            }
            let a = await csguild.channels.cache.find((xxx) => xxx.name === "DESTEK");
            if(csguild.channels.cache.some((kk) => kk.name === `destek-${csguild.members.cache.get(member.id).user.username.toLowerCase() + csguild.members.cache.get(member.id).user.discriminator}`) == true)
              return msj.edit(`**Destek Sistemi Açma İşlemi Başarısız!\nSebep: \`Açılmış Zaten 1 Tane Destek Talebiniz Var.\`**`, true).catch(() => {})
          csguild.channels.create(`destek-${member.user.tag}`).then(async (c)=> {
                if(a){
                  c.setParent(a).catch(() => {})
                }
            
                setTimeout(async() => {
                  const csrole = csguild.roles.cache.get(data.rolID)
                  await c.createOverwrite(csrole, {
                    SEND_MESSAGES: true,
                    VIEW_CHANNEL: true,
                    READ_MESSAGE_HISTORY: true
                  }).catch(() => {})
           const csrole2 = csguild.roles.cache.find((r) => r.name === "@everyone")
                await c.createOverwrite(csrole2,{
                    SEND_MESSAGES: false,
                    VIEW_CHANNEL: false
                  }).catch(() => {})

                await c.createOverwrite(member, {
                  SEND_MESSAGES: true,
                  VIEW_CHANNEL: true,
                  READ_MESSAGE_HISTORY: true
                }).catch(() => {})
              }, 2000)
                msj.edit(`Destek kanalın başarıyla oluşturuldu. **Kanal:** ${c}`,true).catch(() => {})
                let button = new disbut.MessageButton()
                .setLabel("Close")
                .setEmoji("🔒")
                .setStyle("grey")
                .setID("dcsticketsil");

                 c.send({
                  embed: new Discord.MessageEmbed() 
                  .setColor("GREEN")
                  .setAuthor(`${client.user.username} | Destek Sistemi`)
                  .addField(
                    `Size Nasıl Yardımcı Olabilirim ?`,"🎟️"
                  )
                  .setFooter(`${client.user.username} | Destek Sistemi`)
                  .setTimestamp(),button: button}).then(async csmesaj => {
                    c.send("<@"+member.id+"> | <@&"+csrol+">")
            await db.set(csguild.id+"-"+c.id, csmesaj.id)
            await db.set(csguild.id+"-"+c.id+"-"+c.id, member.user.tag)
                }).catch(() => {})
          }).catch(() => {})
    
        })
        }
      }
//yılmaz dev
      if(button.id === "dcsticketsil"){
        button.reply.think(true).then(async msj => {
const mesajdata = db.get(button.message.guild.id+"-"+button.message.channel.id)
if(mesajdata){
  const mesajdata2 = await button.message.channel.messages.fetch(mesajdata)
  if(mesajdata2){

    let button = new disbut.MessageButton()
    .setLabel("Cancel")
    .setStyle("red")
    .setID("dcsticketsil2")

    let button2 = new disbut.MessageButton()
    .setLabel("Close")
    .setStyle("green")
    .setID("dcsticketsil3")

    msj.edit(`Bu bileti kapatmak istediğinizden emin misiniz?`, true).catch(() => {})
    mesajdata2.edit({
      embed: new Discord.MessageEmbed() 
      .setColor("GREEN")
      .setAuthor(`${client.user.username} | Destek Sistemi`)
      .addField(`Destek Talebini Kapatmak İçin \`Close\` Butonuna Tıklaya Bilirsiniz!`,"🎟️")
      .setFooter(`${client.user.username} | Destek Sistemi`)
      .setTimestamp(),button: [button2, button]}).catch(() => {})
    
  }
}
        })
      }


      if(button.id === "dcsticketsil2"){
        button.reply.think(true).then(async msj => {
        const mesajdata = db.get(button.message.guild.id+"-"+button.message.channel.id)
        if(mesajdata){
          const mesajdata2 = await button.message.channel.messages.fetch(mesajdata)
          if(mesajdata2){
            
            let button = new disbut.MessageButton()
            .setLabel("Close")
            .setEmoji("🔒")
            .setStyle("grey")
            .setID("dcsticketsil");

            msj.edit(`Destek talebini kapatma işlemi iptal edildi.`, true).catch(() => {})
            mesajdata2.edit({
              embed: new Discord.MessageEmbed() 
              .setColor("GREEN")
              .setAuthor(`${client.user.username} | Destek Sistemi`)
              .addField(`Destek Talebini Kapatmak İçin \`Close\` \n Butonuna Tıklaya Bilirsiniz!`)
              .setTimestamp(),button: [button]}).catch(() => {})
            
          }
        }
      })
              }

              if(button.id === "dcsticketsil3"){
                button.reply.think(true).then(async msj => {
                const mesajdata = db.get(button.message.guild.id+"-"+button.message.channel.id)
                if(mesajdata){
                  const mesajdata2 = await button.message.channel.messages.fetch(mesajdata)
                  if(mesajdata2){

                    msj.edit(`Destek talebiniz kapatılıyor, Lütfen bekleyin...`, true).catch(() => {})
            const datadd = db.get(csguild.id+"-"+button.message.channel.id+"-"+button.message.channel.id) || member.user.tag
                    setTimeout(async () => {
                    await button.message.channel.createOverwrite(member, {
                      SEND_MESSAGES: false,
                      VIEW_CHANNEL: false
                    }).catch(() => {})
                    await button.message.channel.setName("kapalı-"+datadd).catch(() => {})
                    await db.delete(csguild.id+"-"+button.message.channel.id+"-"+button.message.channel.id)
                  }, 3000)
                  setTimeout(async () => {
                    let button = new disbut.MessageButton()
                    .setLabel("Talebi Sil")
                    .setStyle("green")
                    .setID("dcstickettemizle");
    
                    mesajdata2.edit({
                      embed: new Discord.MessageEmbed() 
                      .setColor("GREEN")
                      .setAuthor(`${client.user.username} | Destek Sistemi`)  
                      .addField("Talep Kapatıldı", "Bu Destek Talebi, Kullanıcı Tarafından Kapatıldı. Tamamen Silmek İçin **'Talebi Sil'** İsimli Butona Tıklayınız!")
                      .setFooter(`${client.user.username} | Destek Sistemi`)
                      .setTimestamp(),button: [button]}).catch(() => {})
                  }, 6000)
                }
                }
              })
                      }


                      if(button.id === "dcstickettemizle"){
                        button.reply.think(true).then(async msj => {
                        const mesajdata = db.get(button.message.guild.id+"-"+button.message.channel.id)
                        if(mesajdata){
                          const mesajdata2 = await button.message.channel.messages.fetch(mesajdata)
                          if(mesajdata2){
                            const mem2 = csguild.members.cache.get(button.clicker.user.id)
                            if(mem2.roles.cache.has(csrol.id)){
                            msj.edit(`Destek talebi 5 saniye sonra tamamen temizlenecektir.`, true).catch(() => {})
     
                          setTimeout(async () => {
                          await button.message.channel.delete().catch(() => {})
                          await db.delete(button.message.guild.id+"-"+button.message.channel.id)
                          await db.delete("mesajsize-"+button.message.channel.id+"-"+button.message.guild.id)
                          await db.delete(csguild.id+"-"+button.message.channel.id+"-"+button.message.channel.id)
                          }, 5000)
                            } else {
                              msj.edit("Destek taleplerini sadece <@&"+csrol.id+"> isimli role sahip kişiler sile bilir.").catch(() => {})
                            }
                        }
                        }
                      })
                              }

    } else {
      button.reply.think(true).then(async msj => {
        const cdguild2 = button.message.guild
        const data = db.get("csticket." + cdguild2.id);
        const sunucu = client.guilds.cache.get(data.sunucuID);
        if (!sunucu) {
          db.delete("csticket." + data.sunucuID);
        } else {
          const kanal = sunucu.channels.cache.get(data.kanal);
          if (!kanal) {
            db.delete("csticket." + data.sunucuID);
          } else {
            const data2 = kanal.messages.fetch(data.mesajID);
            if (!data2) {
              db.delete("csticket." + data.sunucuID);
            } else {
              data2.then((mr) => mr.delete().catch(() => {})).catch((e) => {});
        msj.edit("Bu sunucuda ayarlanan destek yetkilisi rolünü bulamadım bu yüzden sistem kapandı!").catch(() => {})
        let a = button.message.guild.channels.cache.find((xxx) => xxx.name === "DESTEK")
        if (a) {
          setTimeout(() => {
          button.message.guild.channels.cache.filter(cs => cs.parentID === a.id).map(cs => cs.delete().catch(() => {}))
          }, 5000)
          setTimeout(() => {
          a.delete().catch(() => {})
          }, 10000)
        }
        button.message.guild.owner.send("Ticket Sistemi İçin Ayarlanan **Yetkili Rolü** Bulunamadığı İçin Sistem Kapandı ve Bütün Destek Talepleri Silindi!").catch(() => {})
      await db.delete("csticket." + button.message.guild.id);
            }}}
      })
    }
  }
} 
});

client.on("message", async message => {
  if(message.guild){
  const data = db.get("csticket." + message.guild.id);
  if(data){
  if(data.kanal === message.channel.id){
  if(!message.member.hasPermission("MANAGE_GUILD")){
    await message.delete().catch(() => {})
}}}
  }
});

client.on("message", async message => {
  if(message.guild){
    if(db.get("csticket." + message.guild.id)){
      if(message.channel.name.includes("destek-")){
        await db.add("mesajsize-"+message.channel.id+"-"+message.guild.id, 1)
        const data = db.get("mesajsize-"+message.channel.id+"-"+message.guild.id)
        if(data){
          if(data > 50){
 await db.delete("mesajsize-"+message.channel.id+"-"+message.guild.id)

            let button = new disbut.MessageButton()
            .setLabel("Close")
            .setStyle("grey")
            .setID("dcsticketsil")

            message.channel.send({
              embed: new Discord.MessageEmbed() 
              .setColor("GREEN")
              .setAuthor(`${client.user.username} | Destek Sistemi`)
              .setDescription("Hey Bu Talepte İşin Bittimi? Kapatmak İçin Aşşağıdaki **'Close'** İsimli Butona Tıklaya Bilirsin!","🎟️")
              .setFooter(`${client.user.username} | Destek Sistemi`)
              .setTimestamp(),button: button}).then(msj => {
                 db.set(message.guild.id+"-"+message.channel.id, msj.id)
              })
          }
        }
      }
    }
  }
})
