const Discord = require("discord.js");
const disbut = require("discord-buttons");
const db = require("orio.db");
const ayarlar = require("../ayarlar.json");

exports.run = async (client, message, args) => {
  var prefix = ayarlar.prefix;

  if (!message.member.hasPermission("MANAGE_GUİLD"))
    return message.channel.send(`**Buna Yetkin Yok!**`);
  if (!["kapat", "aç"].includes(args[0])) {
    return message.channel.send(
      new Discord.MessageEmbed()
        .setColor("RED")
        .setAuthor(`${client.user.username} Destek Sistemi`)
        .setDescription(
          `**\`${prefix}destek aç @YETKİLİ_ROL #KANAL\` veya \`${prefix}destek kapat\`**`
        )
        .setFooter(
          `Komutu Kullanan: ${message.author.tag}`,
          `${message.author.avatarURL()}`
        )
    ).catch(() => {})
  }

  if (args[0] == "kapat") {
    if (!db.get("csticket." + message.guild.id))
      return message.reply(
        "**Destek Sistemi Bu Sunucuda Zaten Kurulu Değil!**"
      ).catch(() => {})
    const data = db.get("csticket." + message.guild.id);
    db.delete(`csticket.${message.guild.id}`);
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
          db.delete("csticket." + data.sunucuID);
          data2.then((mr) => mr.delete({ timeout: 200 }).catch(() => {})).catch((e) => {});
          let a = message.guild.channels.cache.find((xxx) => xxx.name === "DESTEK")
          if (a) {
            message.guild.channels.cache.filter(cs => cs.parentID === a.id).map(cs => cs.delete().catch(() => {}))
            setTimeout(() => {
            a.delete().catch(() => {})
            }, 10000)
          }
          message.channel.send(`**Destek Sistemi Başarıyla Kapatılıyor; \n Eyer Daha Önceden Açtığınız Bir Destek Sistemi Varsa 10 Saniye İçirisin de Silinecektir!**`);
        }
      }
    }
  }

  if (args[0] == "aç") {
    const data = db.get("csticket." + message.guild.id);
    if (data)
      return message.reply(
        "Zaten Hali Hazırda Bir Destek Sistemi Açık!\nKapatmak İçin `" +
        prefix 
        + "destek kapat` " 
      ).catch(() => {})

    let role = message.mentions.roles.first();
    if (!role)
      return message.reply("**Bir Destek Ekibi Rolü Etiketlemen Gerek!**").catch(() => {})

    let akanal = message.mentions.channels.first();
    if (!akanal) return message.reply("**Bir Kanal Etiketlemen Gerek!**").catch(() => {})

    message.react("✅");

    let button = new disbut.MessageButton()
    .setLabel("Create Ticket!")
    .setStyle("blurple")
    .setEmoji("📩")
    .setID("dcsticket");

  akanal
    .send({
      embed: new Discord.MessageEmbed()
        .setTitle(client.user.username + " Ticket Bot")
        .setColor("GREEN")
        .setDescription("Teknik Ticket Almak İstiyorsanız Emojiye Tıklayarak Canlı Ticket Görevlileri İle \n Konuşabilirsiniz. 📩 ")
        .setTimestamp()
        .setFooter("Yılmaz Script"),

      button: button,
      })
      .then(async (cs) => {
        db.set("csticket." + message.guild.id, {
          kanal: akanal.id,
          mesajID: cs.id,
          sunucuID: message.guild.id,
          rolID: role.id,
        });
      }).catch(() => {})
  }
};
exports.conf = {
  aliases: ["ticket", "ticket-sistemi"],
};

exports.help = {
  name: "destek",
};
