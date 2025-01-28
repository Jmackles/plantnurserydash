import json
from collections import defaultdict

# Input data (replace with loading from a file if needed)
data = [
    [
  {
    "id": 1,
    "botanical": "Abelia x",
    "common": "'Canyon Creek' Abelia"
  },
  {
    "id": 2,
    "botanical": "Abelia x",
    "common": "'Kaleidoscope' Abelia"
  },
  {
    "id": 3,
    "botanical": "Abelia x",
    "common": "'Mardi Gras' Abelia"
  },
  {
    "id": 4,
    "botanical": "Abelia x",
    "common": "'Rose Creek' Abelia"
  },
  {
    "id": 5,
    "botanical": "Abelia x",
    "common": "Twist of Mango Abelia"
  },
  {
    "id": 6,
    "botanical": "Abelia x ",
    "common": "'Radiance' Abelia"
  },
  {
    "id": 7,
    "botanical": "Abelia x 'Edward Goucher'",
    "common": "Pink Abelia "
  },
  {
    "id": 8,
    "botanical": "Abelia x 'Hopley's'",
    "common": "Miss Lemon (Twist of Lime) Abelia"
  },
  {
    "id": 9,
    "botanical": "Abelia x grandiflora",
    "common": "Glossy Abelia"
  },
  {
    "id": 10,
    "botanical": "Achillea",
    "common": "Yarrow"
  },
  {
    "id": 11,
    "botanical": "Acorus",
    "common": "Sweet Flag"
  },
  {
    "id": 12,
    "botanical": "Acorus",
    "common": "Dwarf Sweet Flag"
  },
  {
    "id": 13,
    "botanical": "Aesculus pavia ",
    "common": "Red Buckeye"
  },
  {
    "id": 14,
    "botanical": "Agapanthus",
    "common": "Lily of the Nile"
  },
  {
    "id": 15,
    "botanical": "Agastache",
    "common": "Anise Hyssop"
  },
  {
    "id": 16,
    "botanical": "Ajuga",
    "common": "Bugleflower"
  },
  {
    "id": 17,
    "botanical": "Alcea",
    "common": "Holly Hock"
  },
  {
    "id": 18,
    "botanical": "Allium",
    "common": "Ornamental Onion"
  },
  {
    "id": 19,
    "botanical": "Alocasia/Colocasia",
    "common": "Elephant Ear"
  },
  {
    "id": 20,
    "botanical": "Alstroemeria",
    "common": "Peruvian Lily (Princess Lily)"
  },
  {
    "id": 21,
    "botanical": "Alternanthera",
    "common": "Joseph's Coat"
  },
  {
    "id": 22,
    "botanical": "Amelanchier alnifolia",
    "common": "Service Berry"
  },
  {
    "id": 23,
    "botanical": "Amsonia hubrichtii",
    "common": "Arkansas Amsonia"
  },
  {
    "id": 24,
    "botanical": "Amsonia sp.",
    "common": "Amsonia"
  },
  {
    "id": 25,
    "botanical": "Amsonia x 'Blue Ice'",
    "common": "Blue Star Amsonia"
  },
  {
    "id": 26,
    "botanical": "Anemone x",
    "common": "Japanese Anemone"
  },
  {
    "id": 27,
    "botanical": "Antirrhinum",
    "common": "Snap Dragons"
  },
  {
    "id": 28,
    "botanical": "Aquilegia",
    "common": "Columbine"
  },
  {
    "id": 29,
    "botanical": "Ardisia japonica",
    "common": "Ardisia"
  },
  {
    "id": 30,
    "botanical": "Aronia",
    "common": "Chokeberry"
  },
  {
    "id": 31,
    "botanical": "Aronia melanocarpa",
    "common": "Low Scape Mound Chokeberry"
  },
  {
    "id": 32,
    "botanical": "Artemisia",
    "common": "Wormwood"
  },
  {
    "id": 33,
    "botanical": "Artemisia",
    "common": "Wormwood TALL CHECK BEFORE PRINTING"
  },
  {
    "id": 34,
    "botanical": "Asclepias tuberosa",
    "common": "Butterfly Weed/Milkweed"
  },
  {
    "id": 35,
    "botanical": "Aspidistra elatior",
    "common": "Cast Iron Plant"
  },
  {
    "id": 36,
    "botanical": "Aspidistra elatior",
    "common": "Tiny Tank Dwarf Cast Iron Plant"
  },
  {
    "id": 37,
    "botanical": "Aster (Symphyotrichum)",
    "common": "Aster"
  },
  {
    "id": 38,
    "botanical": "Astilbe",
    "common": "Astilbe"
  },
  {
    "id": 39,
    "botanical": "Aucuba japonica ",
    "common": "Aucuba"
  },
  {
    "id": 40,
    "botanical": "Aucuba japonica ",
    "common": "Dwarf Speckled Aucuba"
  },
  {
    "id": 41,
    "botanical": "Aucuba japonica ",
    "common": "Gold Dust Aucuba"
  },
  {
    "id": 42,
    "botanical": "Aucuba japonica ",
    "common": "Golden King Aucuba"
  },
  {
    "id": 43,
    "botanical": "Aucuba japonica ",
    "common": "Star Speckled Aucuba"
  },
  {
    "id": 44,
    "botanical": "Bada Bing / Bada Boom",
    "common": "Wax Begonia"
  },
  {
    "id": 45,
    "botanical": "Baptisia australis",
    "common": "False Indigo"
  },
  {
    "id": 46,
    "botanical": "Baptisia x",
    "common": "Hybrid False Indigo"
  },
  {
    "id": 47,
    "botanical": "Berberis thunbergii",
    "common": "Barberry"
  },
  {
    "id": 48,
    "botanical": "Berberis thunbergii",
    "common": "Admiration Barberry"
  },
  {
    "id": 49,
    "botanical": "Berberis thunbergii",
    "common": "Bonanza Gold Barberry"
  },
  {
    "id": 50,
    "botanical": "Berberis thunbergii",
    "common": "Concorde Barberry"
  },
  {
    "id": 51,
    "botanical": "Berberis thunbergii",
    "common": "Crimson Pygmy Barberry"
  },
  {
    "id": 52,
    "botanical": "Berberis thunbergii",
    "common": "Crimson Ruby Barberry"
  },
  {
    "id": 53,
    "botanical": "Berberis thunbergii",
    "common": "Golden Nugget Barberry"
  },
  {
    "id": 54,
    "botanical": "Berberis thunbergii",
    "common": "Golden Rocket Barberry"
  },
  {
    "id": 55,
    "botanical": "Berberis thunbergii",
    "common": "Golden Ruby Barberry"
  },
  {
    "id": 56,
    "botanical": "Berberis thunbergii",
    "common": "Orange Rocket Barberry"
  },
  {
    "id": 57,
    "botanical": "Berberis thunbergii",
    "common": "Pygmy Ruby Barberry"
  },
  {
    "id": 58,
    "botanical": "Berberis thunbergii",
    "common": "Rosy Glow Barberry"
  },
  {
    "id": 59,
    "botanical": "Berberis thunbergii",
    "common": "Royal Burgundy Barberry"
  },
  {
    "id": 60,
    "botanical": "Bougainvillea",
    "common": "Bougainvillea "
  },
  {
    "id": 61,
    "botanical": "Bracteantha",
    "common": "Strawflower"
  },
  {
    "id": 62,
    "botanical": "Brunnera",
    "common": "Brunnera "
  },
  {
    "id": 63,
    "botanical": "Buddleia",
    "common": "Assorted Butterfly Bush"
  },
  {
    "id": 64,
    "botanical": "Buddleia",
    "common": "Pugster Blue Butterfly Bush"
  },
  {
    "id": 65,
    "botanical": "Buddleia",
    "common": "Pugster Pink Butterfly Bush"
  },
  {
    "id": 66,
    "botanical": "Buddleia",
    "common": "Pugster Pinker Butterfly Bush"
  },
  {
    "id": 67,
    "botanical": "Buddleia",
    "common": "Pugster Amethyst Butterfly Bush"
  },
  {
    "id": 68,
    "botanical": "Buddleia",
    "common": "Pugster White Butterfly Bush"
  },
  {
    "id": 69,
    "botanical": "Buddleia",
    "common": "Pugster Periwinkle Butterfly Bush"
  },
  {
    "id": 70,
    "botanical": "Butia capitata",
    "common": "Pindo Palm"
  },
  {
    "id": 71,
    "botanical": "Buxus harlandii",
    "common": "Richard Boxwood "
  },
  {
    "id": 72,
    "botanical": "Buxus microphylla",
    "common": "Baby Gem Boxwood "
  },
  {
    "id": 73,
    "botanical": "Buxus microphylla",
    "common": "Baby Jade Boxwood "
  },
  {
    "id": 74,
    "botanical": "Buxus microphylla",
    "common": "Golden Triumph Boxwood"
  },
  {
    "id": 75,
    "botanical": "Buxus microphylla",
    "common": "'Golden Dream' Boxwood"
  },
  {
    "id": 76,
    "botanical": "Buxus microphylla ",
    "common": "Green Borders Boxwood "
  },
  {
    "id": 77,
    "botanical": "Buxus microphylla ",
    "common": "Tide Hill Boxwood "
  },
  {
    "id": 78,
    "botanical": "Buxus microphylla ",
    "common": "Winter Gem Boxwood "
  },
  {
    "id": 79,
    "botanical": "Buxus microphylla ",
    "common": "Wintergreen Boxwood "
  },
  {
    "id": 80,
    "botanical": "Buxus microphylla 'Grace Hendrick Phillips'",
    "common": "Little Leaf Boxwood"
  },
  {
    "id": 81,
    "botanical": "Buxus sempervirens",
    "common": "Tall Boy Boxwood "
  },
  {
    "id": 82,
    "botanical": "Buxus sempervirens",
    "common": "Unraveled Boxwood"
  },
  {
    "id": 83,
    "botanical": "Buxus sempervirens",
    "common": "Variegated English Boxwood "
  },
  {
    "id": 84,
    "botanical": "Buxus sempervirens",
    "common": "'Skywalker' Boxwood"
  },
  {
    "id": 85,
    "botanical": "Buxus x",
    "common": "NewGen Freedom Boxwood"
  },
  {
    "id": 86,
    "botanical": "Buxus x",
    "common": "Green Velvet Boxwood "
  },
  {
    "id": 87,
    "botanical": "Buxus x",
    "common": "Little Missy Boxwood "
  },
  {
    "id": 88,
    "botanical": "Buxus x",
    "common": "NewGen Independence Boxwood"
  },
  {
    "id": 89,
    "botanical": "Buxus x ",
    "common": "Green Mountain Boxwood "
  },
  {
    "id": 90,
    "botanical": "Buxus x 'RLH-BI' AKA Emerald Knoll",
    "common": "NewGen Liberty Belle Boxwood"
  },
  {
    "id": 91,
    "botanical": "Calibrachoa",
    "common": "Million Bells"
  },
  {
    "id": 92,
    "botanical": "Callicarpa americana",
    "common": "American Beautyberry"
  },
  {
    "id": 93,
    "botanical": "Callicarpa dichtoma",
    "common": "Asian Beautyberry"
  },
  {
    "id": 94,
    "botanical": "Calycanthus floridus",
    "common": "Sweet Shrub, Allspice"
  },
  {
    "id": 95,
    "botanical": "Calycanthus floridus",
    "common": "Burgundy Spice Sweet Shrub"
  },
  {
    "id": 96,
    "botanical": "Camellia japonica ",
    "common": "Adayaka Camellia"
  },
  {
    "id": 97,
    "botanical": "Camellia japonica ",
    "common": "April Kiss Camellia"
  },
  {
    "id": 98,
    "botanical": "Camellia japonica ",
    "common": "April Snow Camellia"
  },
  {
    "id": 99,
    "botanical": "Camellia japonica ",
    "common": "Corkscrew Camellia"
  },
  {
    "id": 100,
    "botanical": "Camellia japonica ",
    "common": "High Fragrance Camellia"
  },
  {
    "id": 101,
    "botanical": "Camellia japonica ",
    "common": "Junior Miss Camellia"
  },
  {
    "id": 102,
    "botanical": "Camellia japonica ",
    "common": "Kramer's Supreme Camellia"
  },
  {
    "id": 103,
    "botanical": "Camellia japonica ",
    "common": "Lady Vansittart Camellia"
  },
  {
    "id": 104,
    "botanical": "Camellia japonica ",
    "common": "Sea Foam Camellia"
  },
  {
    "id": 105,
    "botanical": "Camellia japonica ",
    "common": "Royal Velvet Camellia "
  },
  {
    "id": 106,
    "botanical": "Camellia japonica ",
    "common": "White by the Gate Camellia"
  },
  {
    "id": 107,
    "botanical": "Camellia japonica ",
    "common": "'April Tryst' Camellia"
  },
  {
    "id": 108,
    "botanical": "Camellia japonica ",
    "common": "'Spring's Promise' Camellia"
  },
  {
    "id": 109,
    "botanical": "Camellia japonica ",
    "common": "'Ack-Scent' Camellia"
  },
  {
    "id": 110,
    "botanical": "Camellia japonica ",
    "common": "'Sadaharu Oh' Camellia"
  },
  {
    "id": 111,
    "botanical": "Camellia japonica ",
    "common": "'Greensboro Red' Camellia"
  },
  {
    "id": 112,
    "botanical": "Camellia japonica ",
    "common": "'Rosehill Red' Camellia"
  },
  {
    "id": 113,
    "botanical": "Camellia japonica ",
    "common": "'Nuccio's Bella Rossa' Camellia"
  },
  {
    "id": 114,
    "botanical": "Camellia japonica ",
    "common": "'April Dawn' Camellia"
  },
  {
    "id": 115,
    "botanical": "Camellia japonica ",
    "common": "'Professor Sargent' Camellia"
  },
  {
    "id": 116,
    "botanical": "Camellia japonica ",
    "common": "'Jacks' Camellia"
  },
  {
    "id": 117,
    "botanical": "Camellia japonica ",
    "common": "'Silver Waves' Camellia"
  },
  {
    "id": 118,
    "botanical": "Camellia japonica ",
    "common": "'April Remembered' Camellia"
  },
  {
    "id": 119,
    "botanical": "Camellia sasanqua ",
    "common": "October Magic Snow Camellia"
  },
  {
    "id": 120,
    "botanical": "Camellia sasanqua ",
    "common": "October Magic Inspiration Camellia"
  },
  {
    "id": 121,
    "botanical": "Camellia sasanqua ",
    "common": "October Magic Orchid Camellia"
  },
  {
    "id": 122,
    "botanical": "Camellia sasanqua ",
    "common": "October Magic Pink Perplexion Camellia"
  },
  {
    "id": 123,
    "botanical": "Camellia sasanqua ",
    "common": "Hana Nana Camellia "
  },
  {
    "id": 124,
    "botanical": "Camellia sasanqua ",
    "common": "Rose of Autumn Camellia "
  },
  {
    "id": 125,
    "botanical": "Camellia sasanqua ",
    "common": "Moonshadow Camellia "
  },
  {
    "id": 126,
    "botanical": "Camellia sasanqua ",
    "common": "Autumn Rocket Camellia"
  },
  {
    "id": 127,
    "botanical": "Camellia sasanqua ",
    "common": "Hana Jiman Camellia"
  },
  {
    "id": 128,
    "botanical": "Camellia sasanqua ",
    "common": "Kanjiro Camellia"
  },
  {
    "id": 129,
    "botanical": "Camellia sasanqua ",
    "common": "Leslie Ann Camellia"
  },
  {
    "id": 130,
    "botanical": "Camellia sasanqua ",
    "common": "Setsugekka Camellia"
  },
  {
    "id": 131,
    "botanical": "Camellia sasanqua ",
    "common": "Slim-n-Trim Camellia"
  },
  {
    "id": 132,
    "botanical": "Camellia sasanqua ",
    "common": "Yuletide Camellia"
  },
  {
    "id": 133,
    "botanical": "Camellia sasanqua ",
    "common": "October Magic White Shishi Camellia"
  },
  {
    "id": 134,
    "botanical": "Camellia sasanqua (hiemalis)",
    "common": "October Magic Ruby Camellia "
  },
  {
    "id": 135,
    "botanical": "Camellia sasanqua (hiemalis)",
    "common": "Hot Flash AKA Bella Rouge Camellia"
  },
  {
    "id": 136,
    "botanical": "Camellia sasanqua (hiemalis)",
    "common": "Mine-No-Yuki Camellia"
  },
  {
    "id": 137,
    "botanical": "Camellia sasanqua (hiemalis)",
    "common": "Shishi Gashira Camellia"
  },
  {
    "id": 138,
    "botanical": "Camellia x",
    "common": "Taylor's Perfection Camellia"
  },
  {
    "id": 139,
    "botanical": "Camellia x",
    "common": "'Coral Delight' Camellia"
  },
  {
    "id": 140,
    "botanical": "Camellia x",
    "common": "'Winter's Snowman' Camellia"
  },
  {
    "id": 141,
    "botanical": "Camellia x",
    "common": "'Winter's Joy' Camellia"
  },
  {
    "id": 142,
    "botanical": "Campanula",
    "common": "Spreading Bellflower"
  },
  {
    "id": 143,
    "botanical": "Canna",
    "common": "Canna Lily "
  },
  {
    "id": 144,
    "botanical": "Carex",
    "common": "Native Sedge "
  },
  {
    "id": 145,
    "botanical": "Carex",
    "common": "Sedge "
  },
  {
    "id": 146,
    "botanical": "Carex oshimensis",
    "common": "Everillo Sedge"
  },
  {
    "id": 147,
    "botanical": "Carex oshimensis",
    "common": "Assorted Sedge"
  },
  {
    "id": 148,
    "botanical": "Caryopteris",
    "common": "Blue Beard"
  },
  {
    "id": 149,
    "botanical": "Catharanthus roseus",
    "common": "Annual Vinca"
  },
  {
    "id": 150,
    "botanical": "Cephalanthus occidentalis",
    "common": "Buttonbush"
  },
  {
    "id": 151,
    "botanical": "Cephalotaxus harringtonia",
    "common": "Shrubby Plum Yew"
  },
  {
    "id": 152,
    "botanical": "Cephalotaxus harringtonia",
    "common": "Duke's Gardens Plum Yew"
  },
  {
    "id": 153,
    "botanical": "Cephalotaxus harringtonia",
    "common": "Gold Dragon Plum Yew"
  },
  {
    "id": 154,
    "botanical": "Cephalotaxus harringtonia",
    "common": "Spreading Plum Yew"
  },
  {
    "id": 155,
    "botanical": "Cephalotaxus harringtonia",
    "common": "Upright Plum Yew"
  },
  {
    "id": 156,
    "botanical": "Cephalotaxus harringtonia",
    "common": "Yewtopia Plum Yew"
  },
  {
    "id": 157,
    "botanical": "Ceratostigma plumbaginoides",
    "common": "Hardy Plumbago"
  },
  {
    "id": 158,
    "botanical": "Chaenomeles speciosa",
    "common": "Double Take Quince"
  },
  {
    "id": 159,
    "botanical": "Chamaecyparis obtusa",
    "common": "Spirited Hinoki Cypress"
  },
  {
    "id": 160,
    "botanical": "Chamaecyparis obtusa",
    "common": "Nana Gracilis Hinoki Cypress"
  },
  {
    "id": 161,
    "botanical": "Chamaecyparis obtusa",
    "common": "Fernspray Hinoki Cypress "
  },
  {
    "id": 162,
    "botanical": "Chamaecyparis obtusa",
    "common": "Golden Fernspray Hinoki Cypress "
  },
  {
    "id": 163,
    "botanical": "Chamaecyparis obtusa",
    "common": "Sunspray Hinoki Cypress "
  },
  {
    "id": 164,
    "botanical": "Chamaecyparis obtusa",
    "common": "Tempelhof Hinoki Cypress "
  },
  {
    "id": 165,
    "botanical": "Chamaecyparis obtusa",
    "common": "Verdoni Hinoki Cypress "
  },
  {
    "id": 166,
    "botanical": "Chamaecyparis obtusa",
    "common": "Iseli Green Hinoki Cypress"
  },
  {
    "id": 167,
    "botanical": "Chamaecyparis obtusa",
    "common": "Jade Waves Fernspray False Cypress"
  },
  {
    "id": 168,
    "botanical": "Chamaecyparis obtusa 'Compacta'",
    "common": "Compact Hinoki cypress"
  },
  {
    "id": 169,
    "botanical": "Chamaecyparis obtusa 'Crippsii'",
    "common": "Golden Hinoki Cypress"
  },
  {
    "id": 170,
    "botanical": "Chamaecyparis obtusa 'Gracilis'",
    "common": "Slender Hinoki Cypress"
  },
  {
    "id": 171,
    "botanical": "Chamaecyparis pisifera",
    "common": "Golden Mop Threadleaf Cypress"
  },
  {
    "id": 172,
    "botanical": "Chamaecyparis pisifera",
    "common": "Golden Charm Threadleaf Cypress"
  },
  {
    "id": 173,
    "botanical": "Chamaecyparis pisifera",
    "common": "'King's Gold' Threadleaf Cypress"
  },
  {
    "id": 174,
    "botanical": "Chamaecyparis pisifera",
    "common": "Gold Threadleaf Cypress"
  },
  {
    "id": 175,
    "botanical": "Chasmanthium latifolium",
    "common": "Inland Sea Oats (River Oats)"
  },
  {
    "id": 176,
    "botanical": "Chionanthus virginicum",
    "common": "Grey Beard (Fringe Tree)"
  },
  {
    "id": 177,
    "botanical": "Chrysogonum",
    "common": "Green and Gold"
  },
  {
    "id": 178,
    "botanical": "Clematis terniflora",
    "common": "Sweet Autumn Clematis"
  },
  {
    "id": 179,
    "botanical": "Clethra alnifolia",
    "common": "Hummingbird Summersweet"
  },
  {
    "id": 180,
    "botanical": "Clethra alnifolia",
    "common": "Ruby Spice Summersweet"
  },
  {
    "id": 181,
    "botanical": "Clethra alnifolia",
    "common": "Sixteen Candles Summersweet"
  },
  {
    "id": 182,
    "botanical": "Clethra alnifolia",
    "common": "Vanilla Spice Summersweet"
  },
  {
    "id": 183,
    "botanical": "Clinopodium georgianum",
    "common": "Sweet Savannah Calamint"
  },
  {
    "id": 184,
    "botanical": "Cordyline",
    "common": "Dracaena Palm"
  },
  {
    "id": 185,
    "botanical": "Coreopsis",
    "common": "Threadleaf Tickseed"
  },
  {
    "id": 186,
    "botanical": "Coreopsis",
    "common": "Tickseed"
  },
  {
    "id": 187,
    "botanical": "Cortaderia selloana",
    "common": "Dwarf Pampas Grass"
  },
  {
    "id": 188,
    "botanical": "Cortaderia selloana",
    "common": "Pampas Grass"
  },
  {
    "id": 189,
    "botanical": "Cotinus coggygria",
    "common": "Purple Smoke Tree"
  },
  {
    "id": 190,
    "botanical": "Cotoneaster dammeri",
    "common": "Streib's Findling Cotoneaster"
  },
  {
    "id": 191,
    "botanical": "Cotoneaster x",
    "common": "Emerald Sprite Cotoneaster"
  },
  {
    "id": 192,
    "botanical": "Cotoneaster x suecicus",
    "common": "Cotoneaster"
  },
  {
    "id": 193,
    "botanical": "Crocosmia",
    "common": "Crocosmia (Montbretia)"
  },
  {
    "id": 194,
    "botanical": "Cryptomeria japonica",
    "common": "Giokumo Cryptomeria"
  },
  {
    "id": 195,
    "botanical": "Cryptomeria japonica",
    "common": "Black Dragon Cryptomeria"
  },
  {
    "id": 196,
    "botanical": "Cryptomeria japonica",
    "common": "Dragon Prince Cryptomeria"
  },
  {
    "id": 197,
    "botanical": "Cryptomeria japonica",
    "common": "Globosa Nana Cryptomeria"
  },
  {
    "id": 198,
    "botanical": "Cryptomeria japonica",
    "common": "Gyokuryu Japanese Cedar"
  },
  {
    "id": 199,
    "botanical": "Cuphea",
    "common": "Bat Face"
  },
  {
    "id": 200,
    "botanical": "Cuphea mexicana",
    "common": "Mexican Heather"
  },
  {
    "id": 201,
    "botanical": "Cupressocyparis x ",
    "common": "Leyland Cypress"
  },
  {
    "id": 202,
    "botanical": "Cupressus arizonica",
    "common": "Arizona Cypress"
  },
  {
    "id": 203,
    "botanical": "Cupressus arizonica",
    "common": "Blue Steel Arizona Cypress"
  },
  {
    "id": 204,
    "botanical": "Cupressus macrocarpa",
    "common": "Lemon Cypress"
  },
  {
    "id": 205,
    "botanical": "Daphne odora",
    "common": "Fragrant Winter Daphne"
  },
  {
    "id": 206,
    "botanical": "Datura innoxia",
    "common": "Moonflower Bush"
  },
  {
    "id": 207,
    "botanical": "Delosperma",
    "common": "Ice plant "
  },
  {
    "id": 208,
    "botanical": "Delosperma",
    "common": "Jewel of Desert Ice plant"
  },
  {
    "id": 209,
    "botanical": "Deutzia ",
    "common": "Deutzia"
  },
  {
    "id": 210,
    "botanical": "Dianthus",
    "common": "Dianthus (Pinks)"
  },
  {
    "id": 211,
    "botanical": "Dianthus",
    "common": "Winter Dianthus"
  },
  {
    "id": 212,
    "botanical": "Dicentra",
    "common": "Bleeding Heart"
  },
  {
    "id": 213,
    "botanical": "Dichondra",
    "common": "Silver Falls"
  },
  {
    "id": 214,
    "botanical": "Diervilla x splendens",
    "common": "Kodiak Red Bush Honeysuckle"
  },
  {
    "id": 215,
    "botanical": "Digiplexis",
    "common": "Hybrid Foxglove"
  },
  {
    "id": 216,
    "botanical": "Digitalis",
    "common": "Foxglove"
  },
  {
    "id": 217,
    "botanical": "Distylium ",
    "common": "Jewel Box Distylium"
  },
  {
    "id": 218,
    "botanical": "Distylium ",
    "common": "Blue Cascade Distylium"
  },
  {
    "id": 219,
    "botanical": "Distylium ",
    "common": "Swing Low Distylium"
  },
  {
    "id": 220,
    "botanical": "Distylium ",
    "common": "Cinnamon Girl Distylium"
  },
  {
    "id": 221,
    "botanical": "Distylium ",
    "common": "Coppertone Distylium"
  },
  {
    "id": 222,
    "botanical": "Distylium ",
    "common": "Vintage Jade Distylium"
  },
  {
    "id": 223,
    "botanical": "Distylium ",
    "common": "Linebacker Distylium"
  },
  {
    "id": 224,
    "botanical": "Distylium ",
    "common": "Athens Tower Distylium"
  },
  {
    "id": 225,
    "botanical": "Distylium ",
    "common": "Spring Frost Distylium"
  },
  {
    "id": 226,
    "botanical": "Distylium x",
    "common": "Little Boxer Distylium"
  },
  {
    "id": 227,
    "botanical": "Dryopteris erythrosora",
    "common": "Autumn Fern"
  },
  {
    "id": 228,
    "botanical": "Echinacea",
    "common": "Coneflower"
  },
  {
    "id": 229,
    "botanical": "Edgeworthia chrysantha",
    "common": "Paper Bush"
  },
  {
    "id": 230,
    "botanical": "Epimedium",
    "common": "Bishop's Hat"
  },
  {
    "id": 231,
    "botanical": "Eucalyptus cinerea",
    "common": "Eucalyptus"
  },
  {
    "id": 232,
    "botanical": "Euonymus alatus",
    "common": "Dwarf Burning Bush "
  },
  {
    "id": 233,
    "botanical": "Euonymus americanus",
    "common": "Hearts-A-Busting"
  },
  {
    "id": 234,
    "botanical": "Euonymus fortunei",
    "common": "Wintercreeper"
  },
  {
    "id": 235,
    "botanical": "Euonymus fortunei",
    "common": "Emerald Gaiety Wintercreeper"
  },
  {
    "id": 236,
    "botanical": "Euonymus fortunei",
    "common": "Emerald 'n' Gold Wintercreeper"
  },
  {
    "id": 237,
    "botanical": "Euonymus fortunei 'Kewensis'",
    "common": "Dwarf Wintercreeper"
  },
  {
    "id": 238,
    "botanical": "Euonymus japonica ",
    "common": "Golden Euonymus"
  },
  {
    "id": 239,
    "botanical": "Euonymus japonica ",
    "common": "Silver King Euonymus "
  },
  {
    "id": 240,
    "botanical": "Euonymus japonicus",
    "common": "Greenspire Euonymus"
  },
  {
    "id": 241,
    "botanical": "Eutrochium (Eupatorium)",
    "common": "Joe Pye Weed"
  },
  {
    "id": 242,
    "botanical": "Evolvulus",
    "common": "Blue Daze"
  },
  {
    "id": 243,
    "botanical": "Fairway Mix",
    "common": "Coleus"
  },
  {
    "id": 244,
    "botanical": "Fatsia japonica",
    "common": "Japanese Aralia"
  },
  {
    "id": 245,
    "botanical": "Festuca glauca",
    "common": "Blue Fescue Grass"
  },
  {
    "id": 246,
    "botanical": "Ficus carica",
    "common": "Assorted Fig"
  },
  {
    "id": 247,
    "botanical": "Ficus carica",
    "common": "'Chicago Hardy' Fig"
  },
  {
    "id": 248,
    "botanical": "Ficus carica",
    "common": "'Celeste' Fig"
  },
  {
    "id": 249,
    "botanical": "Ficus pumila",
    "common": "Creeping Fig"
  },
  {
    "id": 250,
    "botanical": "Forsythia x intermediate ",
    "common": "Lynwood Gold Forsythia"
  },
  {
    "id": 251,
    "botanical": "Forsythia x intermediate ",
    "common": "Magical Gold Forsythia"
  },
  {
    "id": 252,
    "botanical": "Forsythia x intermediate ",
    "common": "Showy Border Forsythia"
  },
  {
    "id": 253,
    "botanical": "Fothergilla x",
    "common": "Blue Shadow Fothergilla"
  },
  {
    "id": 254,
    "botanical": "Fothergilla x",
    "common": "Mt. Airy Fothergilla"
  },
  {
    "id": 255,
    "botanical": "Fothergilla x",
    "common": "Fothergilla"
  },
  {
    "id": 256,
    "botanical": "Fragaria",
    "common": "Eversweet Strawberry"
  },
  {
    "id": 257,
    "botanical": "Fragaria",
    "common": "'Seascape' Strawberry"
  },
  {
    "id": 258,
    "botanical": "Gaillardia",
    "common": "Blanket Flower"
  },
  {
    "id": 259,
    "botanical": "Gardenia augusta",
    "common": "Daisy Duke/Little Daisy Gardenia"
  },
  {
    "id": 260,
    "botanical": "Gardenia jasminoides",
    "common": "Fool Proof Gardenia"
  },
  {
    "id": 261,
    "botanical": "Gardenia jasminoides ",
    "common": "August Beauty Gardenia"
  },
  {
    "id": 262,
    "botanical": "Gardenia jasminoides ",
    "common": "Daisy Gardenia"
  },
  {
    "id": 263,
    "botanical": "Gardenia jasminoides ",
    "common": "Double Mint Gardenia"
  },
  {
    "id": 264,
    "botanical": "Gardenia jasminoides ",
    "common": "Frost Proof Gardenia"
  },
  {
    "id": 265,
    "botanical": "Gardenia jasminoides ",
    "common": "Scentamazing Gardenia"
  },
  {
    "id": 266,
    "botanical": "Gardenia jasminoides ",
    "common": "Snow Flurry Gardenia"
  },
  {
    "id": 267,
    "botanical": "Gardenia jasminoides ",
    "common": "Snow Girl Gardenia"
  },
  {
    "id": 268,
    "botanical": "Gardenia jasminoides ",
    "common": "Snow Globe Gardenia"
  },
  {
    "id": 269,
    "botanical": "Gardenia jasminoides ",
    "common": "Snow Puff Gardenia"
  },
  {
    "id": 270,
    "botanical": "Gardenia jasminoides ",
    "common": "Diamond Spire Gardenia"
  },
  {
    "id": 271,
    "botanical": "Gaultheria procumbens",
    "common": "'Peppermint Pearl' Wintergreen"
  },
  {
    "id": 272,
    "botanical": "Gaura",
    "common": "Wand Flower"
  },
  {
    "id": 273,
    "botanical": "Geranium ",
    "common": "Hardy Geranium"
  },
  {
    "id": 274,
    "botanical": "Hakonechloa",
    "common": "Japanese Forest Grass"
  },
  {
    "id": 275,
    "botanical": "Hedera algeriensis",
    "common": "Algerian Ivy"
  },
  {
    "id": 276,
    "botanical": "Hedera helix",
    "common": "English Ivy"
  },
  {
    "id": 277,
    "botanical": "Helichrysum",
    "common": "Licorice Plant"
  },
  {
    "id": 278,
    "botanical": "Helleborus orientalis",
    "common": "Lenten Rose"
  },
  {
    "id": 279,
    "botanical": "Helleborus orientalis",
    "common": "WJ Painted Double Lenten Rose"
  },
  {
    "id": 280,
    "botanical": "Helleborus orientalis",
    "common": "Ashwood Gardens Lenten Rose"
  },
  {
    "id": 281,
    "botanical": "Helleborus orientalis",
    "common": "WJ Fire & Ice Lenten Rose"
  },
  {
    "id": 282,
    "botanical": "Helleborus orientalis",
    "common": "WJ Ruby Wine Lenten Rose"
  },
  {
    "id": 283,
    "botanical": "Helleborus orientalis",
    "common": "WJ Rose Quartz Lenten Rose"
  },
  {
    "id": 284,
    "botanical": "Helleborus orientalis",
    "common": "WJ Picotee Pearl Lenten Rose"
  },
  {
    "id": 285,
    "botanical": "Helleborus orientalis",
    "common": "WJ Red Sapphire Lenten Rose"
  },
  {
    "id": 286,
    "botanical": "Helleborus orientalis",
    "common": "WJ Peppermint Ice Lenten Rose"
  },
  {
    "id": 287,
    "botanical": "Helleborus orientalis",
    "common": "WJ Black Diamond Lenten Rose"
  },
  {
    "id": 288,
    "botanical": "Helleborus orientalis",
    "common": "WJ Cherry Blossom Lenten Rose"
  },
  {
    "id": 289,
    "botanical": "Helleborus x",
    "common": "Hybrid Lenten Rose"
  },
  {
    "id": 290,
    "botanical": "Helleborus x",
    "common": "Hybrid Lenten Rose (Monrovia)"
  },
  {
    "id": 291,
    "botanical": "Hemerocallis",
    "common": "Daylilies"
  },
  {
    "id": 292,
    "botanical": "Heuchera",
    "common": "Coral Bells"
  },
  {
    "id": 293,
    "botanical": "Heucherella",
    "common": "Foamy Bells"
  },
  {
    "id": 294,
    "botanical": "Hibiscus",
    "common": "Hardy Hibiscus (Rosemallow)"
  },
  {
    "id": 295,
    "botanical": "Hibiscus",
    "common": "Tropical Hibiscus"
  },
  {
    "id": 296,
    "botanical": "Hibiscus syriacus",
    "common": "Assorted Althea (Rose of Sharon)"
  },
  {
    "id": 297,
    "botanical": "Hosta",
    "common": "Hosta (Plantain Lily)"
  },
  {
    "id": 298,
    "botanical": "Houttuynia",
    "common": "Chameleon Plant"
  },
  {
    "id": 299,
    "botanical": "Hydrangea arborescens",
    "common": "Annabelle Hydrangea"
  },
  {
    "id": 300,
    "botanical": "Hydrangea arborescens",
    "common": "Incrediball Hydrangea"
  },
  {
    "id": 301,
    "botanical": "Hydrangea arborescens",
    "common": "Invincibelle Wee White Hydrangea"
  },
  {
    "id": 302,
    "botanical": "Hydrangea arborescens",
    "common": "Mountain Hydrangea"
  },
  {
    "id": 303,
    "botanical": "Hydrangea arborescens",
    "common": "Smooth Hydrangea"
  },
  {
    "id": 304,
    "botanical": "Hydrangea macrophylla",
    "common": "Endless Summer Bloomstruck Hydrangea"
  },
  {
    "id": 305,
    "botanical": "Hydrangea macrophylla",
    "common": "Endless Summer Original Hydrangea"
  },
  {
    "id": 306,
    "botanical": "Hydrangea macrophylla",
    "common": "Endless Summer Blushing Bride Hydrangea"
  },
  {
    "id": 307,
    "botanical": "Hydrangea macrophylla",
    "common": "Endless Summer Summer Crush Hydrangea"
  },
  {
    "id": 308,
    "botanical": "Hydrangea macrophylla",
    "common": "Endless Summer Twist-n-Shout Hydrangea"
  },
  {
    "id": 309,
    "botanical": "Hydrangea macrophylla",
    "common": "Nantucket Blue Hydrangea"
  },
  {
    "id": 310,
    "botanical": "Hydrangea macrophylla",
    "common": "Tilt-a-Swirl Hydrangea"
  },
  {
    "id": 311,
    "botanical": "Hydrangea macrophylla",
    "common": "Tiny Tuff Stuff Hydrangea"
  },
  {
    "id": 312,
    "botanical": "Hydrangea macrophylla",
    "common": "Pistachio Hydrangea"
  },
  {
    "id": 313,
    "botanical": "Hydrangea macrophylla",
    "common": "Zebra Hydrangea"
  },
  {
    "id": 314,
    "botanical": "Hydrangea macrophylla",
    "common": "Cherry-Go-Round Hydrangea"
  },
  {
    "id": 315,
    "botanical": "Hydrangea macrophylla",
    "common": "Endless Summer Pop Star Hydrangea"
  },
  {
    "id": 316,
    "botanical": "Hydrangea macrophylla",
    "common": "Eclipse Hydrangea"
  },
  {
    "id": 317,
    "botanical": "Hydrangea paniculata",
    "common": "Limelight Hydrangea"
  },
  {
    "id": 318,
    "botanical": "Hydrangea paniculata",
    "common": "Firelight Hydrangea"
  },
  {
    "id": 319,
    "botanical": "Hydrangea paniculata",
    "common": "Bobo Hydrangea"
  },
  {
    "id": 320,
    "botanical": "Hydrangea paniculata",
    "common": "Little Lime Hydrangea"
  },
  {
    "id": 321,
    "botanical": "Hydrangea paniculata",
    "common": "Vanilla Strawberry "
  },
  {
    "id": 322,
    "botanical": "Hydrangea paniculata",
    "common": "Strawberry Sundae"
  },
  {
    "id": 323,
    "botanical": "Hydrangea paniculata",
    "common": "Quickfire Hydrangea"
  },
  {
    "id": 324,
    "botanical": "Hydrangea paniculata",
    "common": "Little Quickfire Hydrangea"
  },
  {
    "id": 325,
    "botanical": "Hydrangea paniculata",
    "common": "Limelight Prime Hydrangea"
  },
  {
    "id": 326,
    "botanical": "Hydrangea paniculata",
    "common": "Little Lime Punch Hydrangea"
  },
  {
    "id": 327,
    "botanical": "Hydrangea paniculata",
    "common": "Quick Fire Fab Hydrangea"
  },
  {
    "id": 328,
    "botanical": "Hydrangea paniculata",
    "common": "Panicle Hydrangea"
  },
  {
    "id": 329,
    "botanical": "Hydrangea quercifolia",
    "common": "Munchkin Oakleaf Hydrangea"
  },
  {
    "id": 330,
    "botanical": "Hydrangea quercifolia",
    "common": "Oakleaf Hydrangea"
  },
  {
    "id": 331,
    "botanical": "Hypericum frondosum",
    "common": "Sunburst St. Johnswort"
  },
  {
    "id": 332,
    "botanical": "Hypericum x ",
    "common": "Blue Velvet St. Johnswort"
  },
  {
    "id": 333,
    "botanical": "Iberis sempervirens",
    "common": "Candytuft"
  },
  {
    "id": 334,
    "botanical": "Ilex cornuta",
    "common": "Dwarf Burford Holly"
  },
  {
    "id": 335,
    "botanical": "Ilex cornuta",
    "common": "Needlepoint Holly"
  },
  {
    "id": 336,
    "botanical": "Ilex cornuta",
    "common": "Burford Holly"
  },
  {
    "id": 337,
    "botanical": "Ilex cornuta",
    "common": "Carissa Holly"
  },
  {
    "id": 338,
    "botanical": "Ilex crenata",
    "common": "Helleri Holly"
  },
  {
    "id": 339,
    "botanical": "Ilex crenata",
    "common": "Sky Pencil Holly "
  },
  {
    "id": 340,
    "botanical": "Ilex crenata",
    "common": "Sky Pointer Holly "
  },
  {
    "id": 341,
    "botanical": "Ilex crenata",
    "common": "Soft Touch Holly "
  },
  {
    "id": 342,
    "botanical": "Ilex crenata",
    "common": "Steeds Holly "
  },
  {
    "id": 343,
    "botanical": "Ilex crenata",
    "common": "Ascent Holly"
  },
  {
    "id": 344,
    "botanical": "Ilex crenata",
    "common": "Chubby Hubby Holly"
  },
  {
    "id": 345,
    "botanical": "Ilex crenata 'Compacta'",
    "common": "Compact Japanese Holly"
  },
  {
    "id": 346,
    "botanical": "Ilex glabra",
    "common": "Inkberry Holly"
  },
  {
    "id": 347,
    "botanical": "Ilex glabra",
    "common": "Gem Box Inkberry Holly "
  },
  {
    "id": 348,
    "botanical": "Ilex opaca",
    "common": "Maryland Dwarf Holly"
  },
  {
    "id": 349,
    "botanical": "Ilex verticillata ",
    "common": "Male Winterberry Holly"
  },
  {
    "id": 350,
    "botanical": "Ilex verticillata ",
    "common": "Winterberry Holly"
  },
  {
    "id": 351,
    "botanical": "Ilex vomitoria",
    "common": "Dwarf Yaupon Holly "
  },
  {
    "id": 352,
    "botanical": "Ilex vomitoria",
    "common": "Micron Yaupon Holly "
  },
  {
    "id": 353,
    "botanical": "Ilex vomitoria",
    "common": "Eureka Gold Yaupon Holly "
  },
  {
    "id": 354,
    "botanical": "Ilex vomitoria",
    "common": "Skyline Yaupon Holly"
  },
  {
    "id": 355,
    "botanical": "Ilex vomitoria",
    "common": "Weeping Yaupon Holly "
  },
  {
    "id": 356,
    "botanical": "Ilex vomitoria",
    "common": "Taylor's Rudolf Dwarf Yaupon Holly"
  },
  {
    "id": 357,
    "botanical": "Ilex x",
    "common": "Cherry Bomb Holly"
  },
  {
    "id": 358,
    "botanical": "Ilex x",
    "common": "Nellie R. Stevens Holly"
  },
  {
    "id": 359,
    "botanical": "Ilex x",
    "common": "China Twins Holly"
  },
  {
    "id": 360,
    "botanical": "Ilex x meservae",
    "common": "'Blue Twins' Holly"
  },
  {
    "id": 361,
    "botanical": "Ilex x meserveae",
    "common": "China Girl Holly"
  },
  {
    "id": 362,
    "botanical": "Illicium floridanum",
    "common": "Pink Frost Anise"
  },
  {
    "id": 363,
    "botanical": "Illicium parviflorum ",
    "common": "BananAppeal Anise"
  },
  {
    "id": 364,
    "botanical": "Illicium parviflorum ",
    "common": "Florida Sunshine Anise"
  },
  {
    "id": 365,
    "botanical": "Illicium parviflorum ",
    "common": "Yellow/Tree Anise"
  },
  {
    "id": 366,
    "botanical": "Illicium x",
    "common": "Swamp Hobbit Anise"
  },
  {
    "id": 367,
    "botanical": "Illicium x",
    "common": "Orion Anise"
  },
  {
    "id": 368,
    "botanical": "Illicium x",
    "common": "Woodland Ruby Anise"
  },
  {
    "id": 369,
    "botanical": "Illicium x",
    "common": "Scorpio Anise"
  },
  {
    "id": 370,
    "botanical": "Ipomoea",
    "common": "Sweet Potato Vine"
  },
  {
    "id": 371,
    "botanical": "Iris ensata",
    "common": "Japanese Iris"
  },
  {
    "id": 372,
    "botanical": "Iris germanica",
    "common": "Bearded Iris"
  },
  {
    "id": 373,
    "botanical": "Iris sibirica",
    "common": "Siberian Iris"
  },
  {
    "id": 374,
    "botanical": "Iris virginica",
    "common": "Native Iris"
  },
  {
    "id": 375,
    "botanical": "Isotoma fluviatilis",
    "common": "Blue Star Creeper"
  },
  {
    "id": 376,
    "botanical": "Itea virginica",
    "common": "Little Henry Sweetspire"
  },
  {
    "id": 377,
    "botanical": "Itea virginica",
    "common": "Henry's Garnet Sweetspire"
  },
  {
    "id": 378,
    "botanical": "Itea virginica",
    "common": "Short n Sweet Sweetspire"
  },
  {
    "id": 379,
    "botanical": "Itea virginica",
    "common": "Sweetspire"
  },
  {
    "id": 380,
    "botanical": "Jacobaea maritima",
    "common": "Dusty Miller"
  },
  {
    "id": 381,
    "botanical": "Juncus",
    "common": "Rush"
  },
  {
    "id": 382,
    "botanical": "Juniperus chinenses",
    "common": "Angelica Blue Juniper"
  },
  {
    "id": 383,
    "botanical": "Juniperus chinenses",
    "common": "Daub's Frosted Chinese Juniper"
  },
  {
    "id": 384,
    "botanical": "Juniperus chinenses",
    "common": "Saybrook Gold Juniper "
  },
  {
    "id": 385,
    "botanical": "Juniperus chinenses",
    "common": "Sea Green Juniper "
  },
  {
    "id": 386,
    "botanical": "Juniperus conferta",
    "common": "Blue Pacific Juniper"
  },
  {
    "id": 387,
    "botanical": "Juniperus conferta",
    "common": "Golden Pacific Juniper"
  },
  {
    "id": 388,
    "botanical": "Juniperus horizontalis",
    "common": "Blue Rug Juniper"
  },
  {
    "id": 389,
    "botanical": "Juniperus horizontalis",
    "common": "Golden Carpet Creeping Juniper"
  },
  {
    "id": 390,
    "botanical": "Juniperus horizontalis",
    "common": "Limeglow Juniper"
  },
  {
    "id": 391,
    "botanical": "Juniperus procumbens ",
    "common": "Dwarf Japanese Juniper"
  },
  {
    "id": 392,
    "botanical": "Juniperus squamata",
    "common": "Blue Star Juniper "
  },
  {
    "id": 393,
    "botanical": "Juniperus virginiana",
    "common": "Grey Guardian Juniper"
  },
  {
    "id": 394,
    "botanical": "Juniperus virginiana ",
    "common": "Grey Owl Juniper"
  },
  {
    "id": 395,
    "botanical": "Kalmia latifolia",
    "common": "Mountain Laurel"
  },
  {
    "id": 396,
    "botanical": "Kerria japonica",
    "common": "Japanese Rose"
  },
  {
    "id": 397,
    "botanical": "Kniphofia",
    "common": "Hot Poker"
  },
  {
    "id": 398,
    "botanical": "Kong Series",
    "common": "Coleus"
  },
  {
    "id": 399,
    "botanical": "Lantana",
    "common": "Annual Lantana"
  },
  {
    "id": 400,
    "botanical": "Laurus nobilis",
    "common": "Sweet Bay (Bay Laurel)"
  },
  {
    "id": 401,
    "botanical": "Lavandula",
    "common": "Lavender"
  },
  {
    "id": 402,
    "botanical": "Lavandula",
    "common": "Lavender (Monrovia Grown)"
  },
  {
    "id": 403,
    "botanical": "Lespedeza",
    "common": "Bush Clover"
  },
  {
    "id": 404,
    "botanical": "Leucanthemum",
    "common": "Shasta Daisy"
  },
  {
    "id": 405,
    "botanical": "Leucothoe axillaris",
    "common": "Coastal Dog Hobble"
  },
  {
    "id": 406,
    "botanical": "Leucothoe keiskei",
    "common": "Burning Love Japanese Leucothoe"
  },
  {
    "id": 407,
    "botanical": "Liatris",
    "common": "Blazing Stars"
  },
  {
    "id": 408,
    "botanical": "Ligularia",
    "common": "Ligularia"
  },
  {
    "id": 409,
    "botanical": "Ligularia tussilaginea 'Gigantea'",
    "common": "Tractor Seat Plant"
  },
  {
    "id": 410,
    "botanical": "Ligustrum japonicum",
    "common": "Waxleaf Ligustrum"
  },
  {
    "id": 411,
    "botanical": "Ligustrum japonicum",
    "common": "Wavy Leaf Ligustrum"
  },
  {
    "id": 412,
    "botanical": "Ligustrum japonicum ",
    "common": "Curly Leaf Ligustrum "
  },
  {
    "id": 413,
    "botanical": "Ligustrum japonicum ",
    "common": "Jack Frost Ligustrum "
  },
  {
    "id": 414,
    "botanical": "Ligustrum sinensis",
    "common": "Sunshine Ligustrum "
  },
  {
    "id": 415,
    "botanical": "Ligustrum vulgare 'Swift'",
    "common": "Straight Talk Ligustrum"
  },
  {
    "id": 416,
    "botanical": "Lilium",
    "common": "Asiatic Lily"
  },
  {
    "id": 417,
    "botanical": "Lilium x",
    "common": "Hybrid Asiatic Lily"
  },
  {
    "id": 418,
    "botanical": "Liriope muscari",
    "common": "Big Blue Liriope"
  },
  {
    "id": 419,
    "botanical": "Liriope muscari",
    "common": "Super Blue Liriope"
  },
  {
    "id": 420,
    "botanical": "Liriope muscari",
    "common": "Okina Liriope "
  },
  {
    "id": 421,
    "botanical": "Liriope muscari",
    "common": "Purple Explosion Liriope"
  },
  {
    "id": 422,
    "botanical": "Liriope muscari",
    "common": "Royal Purple Liriope"
  },
  {
    "id": 423,
    "botanical": "Liriope muscari",
    "common": "Variegated Liriope"
  },
  {
    "id": 424,
    "botanical": "Liriope spicata",
    "common": "Spreading Liriope"
  },
  {
    "id": 425,
    "botanical": "Lobelia",
    "common": "Cardinal/Fan Flower"
  },
  {
    "id": 426,
    "botanical": "Lobularia",
    "common": "Alyssum"
  },
  {
    "id": 427,
    "botanical": "Lonicera nitida 'Golden Glow'",
    "common": "Thunderbolt Box Honeysuckle"
  },
  {
    "id": 428,
    "botanical": "Lophospermum",
    "common": "Lofos"
  },
  {
    "id": 429,
    "botanical": "Loropetalum chinensis",
    "common": "Cerise Charm Loropetalum"
  },
  {
    "id": 430,
    "botanical": "Loropetalum chinensis",
    "common": "Crimson Fire Loropetalum"
  },
  {
    "id": 431,
    "botanical": "Loropetalum chinensis",
    "common": "Cherry Blast Loropetalum"
  },
  {
    "id": 432,
    "botanical": "Loropetalum chinensis",
    "common": "Daruma Loropetalum"
  },
  {
    "id": 433,
    "botanical": "Loropetalum chinensis",
    "common": "Everred Loropetalum"
  },
  {
    "id": 434,
    "botanical": "Loropetalum chinensis",
    "common": "Emerald Snow Loropetalum"
  },
  {
    "id": 435,
    "botanical": "Loropetalum chinensis",
    "common": "Garnet Fire Loropetalum"
  },
  {
    "id": 436,
    "botanical": "Loropetalum chinensis",
    "common": "Jazz Hands Bold Loropetalum"
  },
  {
    "id": 437,
    "botanical": "Loropetalum chinensis",
    "common": "Jazz Hands Mini Loropetalum"
  },
  {
    "id": 438,
    "botanical": "Loropetalum chinensis",
    "common": "Jazz Hands Dwarf Green Loropetalum"
  },
  {
    "id": 439,
    "botanical": "Loropetalum chinensis",
    "common": "Jazz Hands White"
  },
  {
    "id": 440,
    "botanical": "Loropetalum chinensis",
    "common": "Jazz Hands Variegated"
  },
  {
    "id": 441,
    "botanical": "Loropetalum chinensis",
    "common": "Jazz Hands Night Moves Loropetalum"
  },
  {
    "id": 442,
    "botanical": "Loropetalum chinensis",
    "common": "Purple Daydream Loropetalum"
  },
  {
    "id": 443,
    "botanical": "Loropetalum chinensis",
    "common": "Purple Diamond Loropetalum"
  },
  {
    "id": 444,
    "botanical": "Loropetalum chinensis",
    "common": "Purple Pixie Loropetalum"
  },
  {
    "id": 445,
    "botanical": "Loropetalum chinensis",
    "common": "Ruby Loropetalum"
  },
  {
    "id": 446,
    "botanical": "Loropetalum chinensis",
    "common": "Sparkling Sangria Loropetalum"
  },
  {
    "id": 447,
    "botanical": "Loropetalum chinensis",
    "common": "Chang's Ruby Loropetalum"
  },
  {
    "id": 448,
    "botanical": "Loropetalum chinensis",
    "common": "Ruby Snow Loropetalum"
  },
  {
    "id": 449,
    "botanical": "Loropetalum chinensis",
    "common": "Zhuzhou Loropetalum"
  },
  {
    "id": 450,
    "botanical": "Loropetalum chinensis",
    "common": "Red Diamond Loropetalum"
  },
  {
    "id": 451,
    "botanical": "Lysimachia congestiflora",
    "common": "Lysimachia"
  },
  {
    "id": 452,
    "botanical": "Lysimachia nummularia",
    "common": "Creeping Jenny"
  },
  {
    "id": 453,
    "botanical": "Magnolia figo (Michelia figo)",
    "common": "Banana Shrub"
  },
  {
    "id": 454,
    "botanical": "Magnolia x",
    "common": "Tulip Magnolia (Little Girl Series)"
  },
  {
    "id": 455,
    "botanical": "Magnolia x soulangiana",
    "common": "Saucer Magnolia"
  },
  {
    "id": 456,
    "botanical": "Mahonia x",
    "common": "Indigo Flair Mahonia"
  },
  {
    "id": 457,
    "botanical": "Mahonia x",
    "common": "Narihira Mahonia"
  },
  {
    "id": 458,
    "botanical": "Mahonia x",
    "common": "Marvel Mahonia"
  },
  {
    "id": 459,
    "botanical": "Mahonia x",
    "common": "Winter Sun Mahonia"
  },
  {
    "id": 460,
    "botanical": "Miscanthus sinensis",
    "common": "Little Kitten Maiden Grass"
  },
  {
    "id": 461,
    "botanical": "Miscanthus sinensis",
    "common": "Adagio Maiden Grass"
  },
  {
    "id": 462,
    "botanical": "Miscanthus sinensis",
    "common": "Yaku Jima Maiden Grass"
  },
  {
    "id": 463,
    "botanical": "Miscanthus sinensis",
    "common": "Maiden Grass"
  },
  {
    "id": 464,
    "botanical": "Monarda",
    "common": "Bee Balm"
  },
  {
    "id": 465,
    "botanical": "Muhlenbergia capillaris",
    "common": "Muhly Grass"
  },
  {
    "id": 466,
    "botanical": "Muhlenbergia capillaris",
    "common": "White Muhly Grass"
  },
  {
    "id": 467,
    "botanical": "Muhlenbergia capillaris",
    "common": "Pink Muhly Grass"
  },
  {
    "id": 468,
    "botanical": "Musa basjoo",
    "common": "Hardy Banana"
  },
  {
    "id": 469,
    "botanical": "Myrica cerifera",
    "common": "Wax Myrtle"
  },
  {
    "id": 470,
    "botanical": "Nandina domestica",
    "common": "Heavenly Bamboo"
  },
  {
    "id": 471,
    "botanical": "Nandina domestica",
    "common": "Firepower Nandina"
  },
  {
    "id": 472,
    "botanical": "Nandina domestica",
    "common": "Harbor Belle Nandina"
  },
  {
    "id": 473,
    "botanical": "Nandina domestica",
    "common": "Gulf Stream Nandina"
  },
  {
    "id": 474,
    "botanical": "Nandina domestica",
    "common": "Lemon Lime Nandina"
  },
  {
    "id": 475,
    "botanical": "Nandina domestica",
    "common": "Blush Pink Nandina"
  },
  {
    "id": 476,
    "botanical": "Nandina domestica",
    "common": "Obsession Nandina"
  },
  {
    "id": 477,
    "botanical": "Nandina domestica",
    "common": "Flirt Nandina"
  },
  {
    "id": 478,
    "botanical": "Nandina domestica",
    "common": "Sunray Nandina"
  },
  {
    "id": 479,
    "botanical": "Nepeta",
    "common": "Catmint"
  },
  {
    "id": 480,
    "botanical": "Oenothera",
    "common": "Primrose"
  },
  {
    "id": 481,
    "botanical": "Olea europaea",
    "common": "Olive"
  },
  {
    "id": 482,
    "botanical": "Ophiopogon jaburan",
    "common": "Crystal Falls Mondo"
  },
  {
    "id": 483,
    "botanical": "Ophiopogon japonicus",
    "common": "Mondo Grass"
  },
  {
    "id": 484,
    "botanical": "Ophiopogon japonicus",
    "common": "Dwarf Mondo Grass"
  },
  {
    "id": 485,
    "botanical": "Osmanthus fragrans",
    "common": "Fragrant Tea Olive"
  },
  {
    "id": 486,
    "botanical": "Osmanthus fragrans",
    "common": "Orange Tea Olive"
  },
  {
    "id": 487,
    "botanical": "Osmanthus fragrans",
    "common": "Noble Lady Tea Olive"
  },
  {
    "id": 488,
    "botanical": "Osmanthus fragrans 'Qiannan Guifei'",
    "common": "Noble Lady Fragrant Tea Olive"
  },
  {
    "id": 489,
    "botanical": "Osmanthus heterophyllus",
    "common": "Goshiki False Holly"
  },
  {
    "id": 490,
    "botanical": "Osmanthus heterophyllus",
    "common": "Party Lights False Holly"
  },
  {
    "id": 491,
    "botanical": "Osmanthus heterophyllus",
    "common": "Gold Japanese False Holly"
  },
  {
    "id": 492,
    "botanical": "Osmanthus heterophyllus 'Kaori Hime'",
    "common": "Party Princess (Fragrant Dwarf) False Holly"
  },
  {
    "id": 493,
    "botanical": "Osmanthus x",
    "common": "Fragrant Dwarf False Holly"
  },
  {
    "id": 494,
    "botanical": "Osmanthus x fortunei",
    "common": "Fortune Tea Olive"
  },
  {
    "id": 495,
    "botanical": "Pachysandra termalis",
    "common": "Pachysandra"
  },
  {
    "id": 496,
    "botanical": "Paeonia",
    "common": "Assorted Itoh Peony"
  },
  {
    "id": 497,
    "botanical": "Paeonia x",
    "common": "Itoh Peony"
  },
  {
    "id": 498,
    "botanical": "Panicum virgatum",
    "common": "Switchgrass"
  },
  {
    "id": 499,
    "botanical": "Pelargonium 'Citronella'",
    "common": "Citronella Geranium"
  },
  {
    "id": 500,
    "botanical": "Pennisetum",
    "common": "Fireworks Fountain Grass"
  },
  {
    "id": 501,
    "botanical": "Pennisetum",
    "common": "Annual Purple Fountain Grass"
  },
  {
    "id": 502,
    "botanical": "Pennisetum alopecuroides",
    "common": "Black Fountain Grass"
  },
  {
    "id": 503,
    "botanical": "Pennisetum x",
    "common": "Red Head Fountain Grass"
  },
  {
    "id": 504,
    "botanical": "Penstemon",
    "common": "Beard Tongue"
  },
  {
    "id": 505,
    "botanical": "Perovskia",
    "common": "Russian Sage"
  },
  {
    "id": 506,
    "botanical": "Philadelphus virginalis",
    "common": "Mock Orange"
  },
  {
    "id": 507,
    "botanical": "Phlox stolinifera",
    "common": "Woodland Phlox"
  },
  {
    "id": 508,
    "botanical": "Phlox subulata",
    "common": "Creeping Phlox (Thrift)"
  },
  {
    "id": 509,
    "botanical": "Phlox x",
    "common": "Garden Phlox"
  },
  {
    "id": 510,
    "botanical": "Physocarpus opulifolius ",
    "common": "Little Devil Ninebark"
  },
  {
    "id": 511,
    "botanical": "Picea abies",
    "common": "Nest Spruce"
  },
  {
    "id": 512,
    "botanical": "Picea abies",
    "common": "Dwarf Blue Spruce"
  },
  {
    "id": 513,
    "botanical": "Picea glauca ",
    "common": "Dwarf Alberta Spruce "
  },
  {
    "id": 514,
    "botanical": "Pieris japonica",
    "common": "Flaming Silver Pieris"
  },
  {
    "id": 515,
    "botanical": "Pieris japonica",
    "common": "Assorted Pieris"
  },
  {
    "id": 516,
    "botanical": "Pieris japonica",
    "common": "Valley Valentine Pieris"
  },
  {
    "id": 517,
    "botanical": "Pieris japonica",
    "common": "Katsura Pieris"
  },
  {
    "id": 518,
    "botanical": "Pieris japonica",
    "common": "Mountain Fire Pieris"
  },
  {
    "id": 519,
    "botanical": "Pieris japonica",
    "common": "'Passion' Pieris"
  },
  {
    "id": 520,
    "botanical": "Pieris japonica ",
    "common": "Southern Lady Pieris"
  },
  {
    "id": 521,
    "botanical": "Pieris japonica ",
    "common": "Prelude Pieris"
  },
  {
    "id": 522,
    "botanical": "Pinus virginiana",
    "common": "Dwarf Virginia Pine"
  },
  {
    "id": 523,
    "botanical": "Pittosporum",
    "common": "Wheeler's Dwarf Pittosporum"
  },
  {
    "id": 524,
    "botanical": "Pittosporum tobira",
    "common": "Pittosporum"
  },
  {
    "id": 525,
    "botanical": "Pittosporum tobira",
    "common": "Mojo Pittosporum"
  },
  {
    "id": 526,
    "botanical": "Pittosporum tobira",
    "common": "Variegated Pittosporum"
  },
  {
    "id": 527,
    "botanical": "Platycodon",
    "common": "Balloon Flower"
  },
  {
    "id": 528,
    "botanical": "Podocarpus macrophyllus",
    "common": "Pringles Dwarf Podocarpus"
  },
  {
    "id": 529,
    "botanical": "Polygonatum",
    "common": "Solomon's Seal"
  },
  {
    "id": 530,
    "botanical": "Prunus caroliniana",
    "common": "Center Court Cherry Laurel"
  },
  {
    "id": 531,
    "botanical": "Prunus laurocerasus",
    "common": "Schip Laurel"
  },
  {
    "id": 532,
    "botanical": "Prunus laurocerasus",
    "common": "Otto Lyuken Laurel"
  },
  {
    "id": 533,
    "botanical": "Pulmonaria",
    "common": "Lungwort"
  },
  {
    "id": 534,
    "botanical": "Pyracomeles",
    "common": "Juke Box Pyracomeles"
  },
  {
    "id": 535,
    "botanical": "Rhaphiolepis",
    "common": "Georgia Petite Indian Hawthorn"
  },
  {
    "id": 536,
    "botanical": "Rhaphiolepis",
    "common": "Snow Cap Indian Hawthorn"
  },
  {
    "id": 537,
    "botanical": "Rhododendron",
    "common": "Assorted Deciduous Azalea"
  },
  {
    "id": 538,
    "botanical": "Rhododendron austrinum",
    "common": "Austrinum Azalea"
  },
  {
    "id": 539,
    "botanical": "Rhododendron calendulaceum x",
    "common": "Tangerine Delight Azalea"
  },
  {
    "id": 540,
    "botanical": "Rhododendron canescens",
    "common": "Camilla's Blush Azalea"
  },
  {
    "id": 541,
    "botanical": "Rhododendron catawbiense",
    "common": "Pink Rhododendron "
  },
  {
    "id": 542,
    "botanical": "Rhododendron catawbiense",
    "common": "White Rhododendron"
  },
  {
    "id": 543,
    "botanical": "Rhododendron catawbiense",
    "common": "Purple Rhododendron"
  },
  {
    "id": 544,
    "botanical": "Rhododendron catawbiense",
    "common": "Lavender Rhododendron"
  },
  {
    "id": 545,
    "botanical": "Rhododendron catawbiense",
    "common": "Lavender Pink Rhododendron"
  },
  {
    "id": 546,
    "botanical": "Rhododendron maximum",
    "common": "Light Pink Rhododendron"
  },
  {
    "id": 547,
    "botanical": "Rhododendron periclymenoides",
    "common": "Rosy Pink Nudiflorum"
  },
  {
    "id": 548,
    "botanical": "Rhododendron periclymenoides x atlanticum",
    "common": "My Mary Azalea "
  },
  {
    "id": 549,
    "botanical": "Rhododendron viscosum",
    "common": "Summer Eyelet Azalea"
  },
  {
    "id": 550,
    "botanical": "Rhododendron x",
    "common": "Assorted Rhododendron"
  },
  {
    "id": 551,
    "botanical": "Rhododendron x",
    "common": "Lavender Pink Rhododendron"
  },
  {
    "id": 552,
    "botanical": "Rhododendron x",
    "common": "Coral Bell Azalea"
  },
  {
    "id": 553,
    "botanical": "Rhododendron x",
    "common": "Delaware Valley White Azalea "
  },
  {
    "id": 554,
    "botanical": "Rhododendron x",
    "common": "Dorothy Hayden Azalea"
  },
  {
    "id": 555,
    "botanical": "Rhododendron x",
    "common": "Fashion Azalea "
  },
  {
    "id": 556,
    "botanical": "Rhododendron x",
    "common": "Flame Creeper Azalea"
  },
  {
    "id": 557,
    "botanical": "Rhododendron x",
    "common": "Formosa Azalea"
  },
  {
    "id": 558,
    "botanical": "Rhododendron x",
    "common": "George Tabor Azalea "
  },
  {
    "id": 559,
    "botanical": "Rhododendron x",
    "common": "Mrs. GG Gerbing Azalea "
  },
  {
    "id": 560,
    "botanical": "Rhododendron x",
    "common": "Girard's Crimson Azalea "
  },
  {
    "id": 561,
    "botanical": "Rhododendron x",
    "common": "Girard's Hot Shot Azalea "
  },
  {
    "id": 562,
    "botanical": "Rhododendron x",
    "common": "Girard's Rose Azalea "
  },
  {
    "id": 563,
    "botanical": "Rhododendron x",
    "common": "Girard's Renee Michelle Azalea "
  },
  {
    "id": 564,
    "botanical": "Rhododendron x",
    "common": "Hardy Gardenia Azalea"
  },
  {
    "id": 565,
    "botanical": "Rhododendron x",
    "common": "Deep Purple Rhododendron"
  },
  {
    "id": 566,
    "botanical": "Rhododendron x",
    "common": "White Rhododendron"
  },
  {
    "id": 567,
    "botanical": "Rhododendron x",
    "common": "Light Pink Rhododendron"
  },
  {
    "id": 568,
    "botanical": "Rhododendron x",
    "common": "Admiral Semmes Azalea "
  },
  {
    "id": 569,
    "botanical": "Rhododendron x",
    "common": "Jacob Allen Azalea"
  },
  {
    "id": 570,
    "botanical": "Rhododendron x",
    "common": "Millennium Azalea"
  },
  {
    "id": 571,
    "botanical": "Rhododendron x",
    "common": "Nathan B. Forrest Azalea"
  },
  {
    "id": 572,
    "botanical": "Rhododendron x",
    "common": "Sautee Sunset Azalea"
  },
  {
    "id": 573,
    "botanical": "Rhododendron x",
    "common": "Stonewall Jackson Azalea"
  },
  {
    "id": 574,
    "botanical": "Rhododendron x",
    "common": "Talulah Sunrise Azalea "
  },
  {
    "id": 575,
    "botanical": "Rhododendron x",
    "common": "Chinzan Azalea"
  },
  {
    "id": 576,
    "botanical": "Rhododendron x",
    "common": "Christmas Cheer Azalea"
  },
  {
    "id": 577,
    "botanical": "Rhododendron x",
    "common": "Conversation Piece Azalea"
  },
  {
    "id": 578,
    "botanical": "Rhododendron x",
    "common": "Herbert Azalea"
  },
  {
    "id": 579,
    "botanical": "Rhododendron x",
    "common": "Hinode-giri Azalea "
  },
  {
    "id": 580,
    "botanical": "Rhododendron x",
    "common": "Pink Gumpo Azalea "
  },
  {
    "id": 581,
    "botanical": "Rhododendron x",
    "common": "Pink Pearl Azalea"
  },
  {
    "id": 582,
    "botanical": "Rhododendron x",
    "common": "Pink Ruffles Azalea "
  },
  {
    "id": 583,
    "botanical": "Rhododendron x",
    "common": "Pleasant White Azalea"
  },
  {
    "id": 584,
    "botanical": "Rhododendron x",
    "common": "Red Ruffles Azalea "
  },
  {
    "id": 585,
    "botanical": "Rhododendron x",
    "common": "The Robe Azalea"
  },
  {
    "id": 586,
    "botanical": "Rhododendron x",
    "common": "Snow Azalea"
  },
  {
    "id": 587,
    "botanical": "Rhododendron x",
    "common": "Sunglow Azalea"
  },
  {
    "id": 588,
    "botanical": "Rhododendron x",
    "common": "Trouper Azalea"
  },
  {
    "id": 589,
    "botanical": "Rhododendron x",
    "common": "White Gumpo Azalea "
  },
  {
    "id": 590,
    "botanical": "Rhododendron x",
    "common": "Osakazuki Azalea"
  },
  {
    "id": 591,
    "botanical": "Rhododendron x",
    "common": "Watchet Azalea"
  },
  {
    "id": 592,
    "botanical": "Rhododendron x",
    "common": "Assorted Reblooming Azaleas"
  },
  {
    "id": 593,
    "botanical": "Rhododendron x",
    "common": "Assorted Bloom-A-Thon Azalea"
  },
  {
    "id": 594,
    "botanical": "Rhododendron x",
    "common": "Robert E. Lee Azalea"
  },
  {
    "id": 595,
    "botanical": "Rhododendron x",
    "common": "Abbey's Re-View"
  },
  {
    "id": 596,
    "botanical": "Rhododendron x",
    "common": "Girard's 'The Robe' Azalea"
  },
  {
    "id": 597,
    "botanical": "Rhododendron x",
    "common": "'Hino Crimson' Azalea"
  },
  {
    "id": 598,
    "botanical": "Rhododendron x",
    "common": "'Congo' Azalea"
  },
  {
    "id": 599,
    "botanical": "Rhododendron x",
    "common": "Hybrid Native Azalea"
  },
  {
    "id": 600,
    "botanical": "Rhododendron x",
    "common": "Assorted Azaleas"
  },
  {
    "id": 601,
    "botanical": "Rhododendron x",
    "common": "Brilliant Azalea"
  },
  {
    "id": 602,
    "botanical": "Rhododendron x",
    "common": "Evensong Azalea"
  },
  {
    "id": 603,
    "botanical": "Rhododendron x",
    "common": "Karen Azalea"
  },
  {
    "id": 604,
    "botanical": "Rhododendron x",
    "common": "Dorothy Rees Azalea"
  },
  {
    "id": 605,
    "botanical": "Rhododendron x",
    "common": "Tama No Hada Azalea"
  },
  {
    "id": 606,
    "botanical": "Rhododendron x ",
    "common": "Red Rhododendron "
  },
  {
    "id": 607,
    "botanical": "Rhododendron x ",
    "common": "Darlin's Dream Azalea "
  },
  {
    "id": 608,
    "botanical": "Rhododendron x (Bloom-A-Thon)",
    "common": "Hilda Niblett Azalea "
  },
  {
    "id": 609,
    "botanical": "Rhododendron x (Bloom-A-Thon)",
    "common": "Midnight Flare Azalea "
  },
  {
    "id": 610,
    "botanical": "Rhododendron x (Bloom-A-Thon)",
    "common": "White Azalea"
  },
  {
    "id": 611,
    "botanical": "Rhododendron x (Bloom-A-Thon)",
    "common": "Bloom-A-Thon Azalea"
  },
  {
    "id": 612,
    "botanical": "Rhododendron x (Encore)",
    "common": "Assorted Encore Azalea"
  },
  {
    "id": 613,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Amethyst Azalea"
  },
  {
    "id": 614,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Angel Azalea"
  },
  {
    "id": 615,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Bonfire Azalea"
  },
  {
    "id": 616,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Carnation Azalea"
  },
  {
    "id": 617,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Cheer Azalea"
  },
  {
    "id": 618,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Chiffon Azalea"
  },
  {
    "id": 619,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Coral Azalea"
  },
  {
    "id": 620,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Debutante Azalea"
  },
  {
    "id": 621,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Embers Azalea"
  },
  {
    "id": 622,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Empress Azalea"
  },
  {
    "id": 623,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Fire Azalea"
  },
  {
    "id": 624,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Ivory Azalea"
  },
  {
    "id": 625,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Jewel Azalea"
  },
  {
    "id": 626,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Lilac Azalea"
  },
  {
    "id": 627,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Lily Azalea"
  },
  {
    "id": 628,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Moonlight Azalea"
  },
  {
    "id": 629,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Princess Azalea"
  },
  {
    "id": 630,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Rouge Azalea"
  },
  {
    "id": 631,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Royalty Azalea"
  },
  {
    "id": 632,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Ruby Azalea"
  },
  {
    "id": 633,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Sangria Azalea"
  },
  {
    "id": 634,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Sunburst Azalea"
  },
  {
    "id": 635,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Sundance Azalea"
  },
  {
    "id": 636,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Sunset Azalea"
  },
  {
    "id": 637,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Twist Azalea"
  },
  {
    "id": 638,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Starburst Azalea"
  },
  {
    "id": 639,
    "botanical": "Rhododendron x (Encore)",
    "common": "Autumn Majesty Azalea"
  },
  {
    "id": 640,
    "botanical": "Rhododendron x (ReBLOOM)",
    "common": "Red Magnificence Azalea"
  },
  {
    "id": 641,
    "botanical": "Rhododendron x (ReBLOOM)",
    "common": "Purple Spectacular Azalea"
  },
  {
    "id": 642,
    "botanical": "Rhododendron x aromi",
    "common": "Goldstrike Azalea"
  },
  {
    "id": 643,
    "botanical": "Rhododendron x aromi",
    "common": "Spring Fanfare Azalea"
  },
  {
    "id": 644,
    "botanical": "Rhododendron x austrinum",
    "common": "Firecracker Azalea"
  },
  {
    "id": 645,
    "botanical": "Rhododendron x austrinum",
    "common": "Kelsey's Glow Azalea"
  },
  {
    "id": 646,
    "botanical": "Rhododendron x austrinum",
    "common": "Lisa's Gold Azalea"
  },
  {
    "id": 647,
    "botanical": "Rhododendron x exbury",
    "common": "Exbury Azalea"
  },
  {
    "id": 648,
    "botanical": "Rhododendron x exbury",
    "common": "Orange Deciduous Azalea"
  },
  {
    "id": 649,
    "botanical": "Rhodoleia henryi",
    "common": "Scarlet Bells Rhodoleia"
  },
  {
    "id": 650,
    "botanical": "Rohdea japonica",
    "common": "Sacred Lily"
  },
  {
    "id": 651,
    "botanical": "Rosa banksiae",
    "common": "Lady Banks' Rose"
  },
  {
    "id": 652,
    "botanical": "Rosa x",
    "common": "Assorted Drift Rose"
  },
  {
    "id": 653,
    "botanical": "Rosa x",
    "common": "Apricot Drift Rose"
  },
  {
    "id": 654,
    "botanical": "Rosa x",
    "common": "Coral Drift Rose"
  },
  {
    "id": 655,
    "botanical": "Rosa x",
    "common": "Lemon Drift Rose"
  },
  {
    "id": 656,
    "botanical": "Rosa x",
    "common": "Popcorn Drift Rose"
  },
  {
    "id": 657,
    "botanical": "Rosa x",
    "common": "Peach Drift Rose"
  },
  {
    "id": 658,
    "botanical": "Rosa x",
    "common": "Pink Drift Rose"
  },
  {
    "id": 659,
    "botanical": "Rosa x",
    "common": "Red Drift Rose"
  },
  {
    "id": 660,
    "botanical": "Rosa x",
    "common": "Double Red Knock Out Rose"
  },
  {
    "id": 661,
    "botanical": "Rosa x",
    "common": "Double Pink Knock Out Rose"
  },
  {
    "id": 662,
    "botanical": "Rosa x",
    "common": "Single Knock Out Rose"
  },
  {
    "id": 663,
    "botanical": "Rosa x",
    "common": "Sunny Knock Out Rose"
  },
  {
    "id": 664,
    "botanical": "Rosa x",
    "common": "Assorted Knock Out Rose"
  },
  {
    "id": 665,
    "botanical": "Rosmarinus officinalis",
    "common": "Rosemary"
  },
  {
    "id": 666,
    "botanical": "Rosmarinus officinalis",
    "common": "Spreading Rosemary"
  },
  {
    "id": 667,
    "botanical": "Rubus",
    "common": "'Heritage' Raspberry"
  },
  {
    "id": 668,
    "botanical": "Rubus",
    "common": "'Latham' Raspberry"
  },
  {
    "id": 669,
    "botanical": "Rubus hayata-koidzumii",
    "common": "Creeping Raspberry"
  },
  {
    "id": 670,
    "botanical": "Rubus x",
    "common": "Assorted Thornless Blackberries"
  },
  {
    "id": 671,
    "botanical": "Rudbeckia",
    "common": "Black-eyed Susan"
  },
  {
    "id": 672,
    "botanical": "Ruellia",
    "common": "Ragin Cajun False Petunia"
  },
  {
    "id": 673,
    "botanical": "Ruellia simplex",
    "common": "Mexican Petunia"
  },
  {
    "id": 674,
    "botanical": "Sabal minor",
    "common": "Dwarf Palmetto Palm"
  },
  {
    "id": 675,
    "botanical": "Salix integra ",
    "common": "Dappled Willow"
  },
  {
    "id": 676,
    "botanical": "Salvia",
    "common": "Tender Salvia"
  },
  {
    "id": 677,
    "botanical": "Salvia",
    "common": "Meadow Sage"
  },
  {
    "id": 678,
    "botanical": "Salvia greggii",
    "common": "Autumn Sage"
  },
  {
    "id": 679,
    "botanical": "Salvia guarantica (Black and Blue var.)",
    "common": "Blue Anise Sage"
  },
  {
    "id": 680,
    "botanical": "Salvia leucantha",
    "common": "Mexican Sage"
  },
  {
    "id": 681,
    "botanical": "Sarcococca ruscifolia",
    "common": "Fragrant Sweetbox"
  },
  {
    "id": 682,
    "botanical": "Scabiosa",
    "common": "Pincushion Flower"
  },
  {
    "id": 683,
    "botanical": "Scaevola",
    "common": "Fan Flower"
  },
  {
    "id": 684,
    "botanical": "Schizachyrium scoparium",
    "common": "Little Blue Stem"
  },
  {
    "id": 685,
    "botanical": "Sedum",
    "common": "'Autumn Joy' Sedum (Stonecrop)"
  },
  {
    "id": 686,
    "botanical": "Sedum (Stonecrop)",
    "common": "'Angelina's Teacup' Sedum"
  },
  {
    "id": 687,
    "botanical": "Sempervivum",
    "common": "Assorted Hens & Chicks"
  },
  {
    "id": 688,
    "botanical": "Setcreasea",
    "common": "Purple Heart"
  },
  {
    "id": 689,
    "botanical": "Silene",
    "common": "Silene (Campion)"
  },
  {
    "id": 690,
    "botanical": "Sisyrinchium",
    "common": "Blue Eyed Grass"
  },
  {
    "id": 691,
    "botanical": "Solanum lycopersicum",
    "common": "Tomato Plants"
  },
  {
    "id": 692,
    "botanical": "Solidago",
    "common": "Goldenrod"
  },
  {
    "id": 693,
    "botanical": "Spirea bumalda",
    "common": "Little Bonnie Spirea"
  },
  {
    "id": 694,
    "botanical": "Spirea japonica",
    "common": "Double Play Gold Spirea"
  },
  {
    "id": 695,
    "botanical": "Spirea japonica",
    "common": "Double Play Candy Corn Spirea"
  },
  {
    "id": 696,
    "botanical": "Spirea japonica",
    "common": "Little Princess Spirea"
  },
  {
    "id": 697,
    "botanical": "Spirea japonica",
    "common": "Double Play Doozie Spirea"
  },
  {
    "id": 698,
    "botanical": "Spirea japonica",
    "common": "Double Play Red Spirea"
  },
  {
    "id": 699,
    "botanical": "Spirea nipponica",
    "common": "Snowmound Spirea"
  },
  {
    "id": 700,
    "botanical": "Spirea thunbergii ",
    "common": "Golden Spirea"
  },
  {
    "id": 701,
    "botanical": "Spirea vanhoutei",
    "common": "Vanhoutte Bridal Spirea"
  },
  {
    "id": 702,
    "botanical": "Spirea x",
    "common": "Goldflame Spirea"
  },
  {
    "id": 703,
    "botanical": "Spirea x",
    "common": "Goldmound Spirea"
  },
  {
    "id": 704,
    "botanical": "Stachys byzantina",
    "common": "Dwarf Lamb's Ear"
  },
  {
    "id": 705,
    "botanical": "Stachys byzantina",
    "common": "Lamb's Ear"
  },
  {
    "id": 706,
    "botanical": "Stachys monnieri",
    "common": "Betony"
  },
  {
    "id": 707,
    "botanical": "Stokesia",
    "common": "Stoke's Aster"
  },
  {
    "id": 708,
    "botanical": "Strobilanthes",
    "common": "Persian Shield"
  },
  {
    "id": 709,
    "botanical": "Syringa  ",
    "common": "Lilac"
  },
  {
    "id": 710,
    "botanical": "Syringa pubescens",
    "common": "Miss Kim Korean Lilac"
  },
  {
    "id": 711,
    "botanical": "Tecoma stans",
    "common": "Esperanza"
  },
  {
    "id": 712,
    "botanical": "Tender Perennial Lantana",
    "common": "Lantana"
  },
  {
    "id": 713,
    "botanical": "Tender Perennial Verbena",
    "common": "Homestead Verbena"
  },
  {
    "id": 714,
    "botanical": "Tender Perennial Verbena",
    "common": "Endurascape Verbena"
  },
  {
    "id": 715,
    "botanical": "Ternstroemia gymnanthera",
    "common": "Japanese Cleyera"
  },
  {
    "id": 716,
    "botanical": "Ternstroemia gymnanthera",
    "common": "Hunny Bun Cleyera"
  },
  {
    "id": 717,
    "botanical": "Ternstroemia gymnanthera",
    "common": "Crown Jewel Cleyera"
  },
  {
    "id": 718,
    "botanical": "Thuja",
    "common": "Ember Waves Arborvitae"
  },
  {
    "id": 719,
    "botanical": "Thuja ",
    "common": "Green Giant Arborvitae "
  },
  {
    "id": 720,
    "botanical": "Thuja occidentalis",
    "common": "Danica Globe Arborvitae "
  },
  {
    "id": 721,
    "botanical": "Thuja occidentalis",
    "common": "Emerald Green Arborvitae "
  },
  {
    "id": 722,
    "botanical": "Thuja occidentalis",
    "common": "Fire Chief Globe Arborvitae"
  },
  {
    "id": 723,
    "botanical": "Thuja occidentalis",
    "common": "Highlights Arborvitae "
  },
  {
    "id": 724,
    "botanical": "Thuja occidentalis",
    "common": "Holmstrup Arborvitae "
  },
  {
    "id": 725,
    "botanical": "Thuja occidentalis",
    "common": "Sienna Sunset Arborvitae"
  },
  {
    "id": 726,
    "botanical": "Thuja occidentalis",
    "common": "Hetz Midget Arborvitae"
  },
  {
    "id": 727,
    "botanical": "Thuja occidentalis",
    "common": "Mr. Bowling Ball Arborvitae"
  },
  {
    "id": 728,
    "botanical": "Thuja occidentalis",
    "common": "'Tater Tot' Arborvitae"
  },
  {
    "id": 729,
    "botanical": "Thuja occidentalis",
    "common": "'Tom Thumb' Arborvitae"
  },
  {
    "id": 730,
    "botanical": "Thuja occidentalis",
    "common": "'Degroot's Spire' Arborvitae"
  },
  {
    "id": 731,
    "botanical": "Thuja occidentalis",
    "common": "Primo Arborvitae"
  },
  {
    "id": 732,
    "botanical": "Thuja occidentalis",
    "common": "Golden Blush' Arborvitae"
  },
  {
    "id": 733,
    "botanical": "Thuja occidentalis 'Jantar'",
    "common": "Amber Gold Arborvitae"
  },
  {
    "id": 734,
    "botanical": "Thuja orientalis ",
    "common": "Franky Boy Arborvitae"
  },
  {
    "id": 735,
    "botanical": "Thuja orientalis ",
    "common": "Morgan Arborvitae "
  },
  {
    "id": 736,
    "botanical": "Thuja plicata",
    "common": "Forever Goldy Arborvitae"
  },
  {
    "id": 737,
    "botanical": "Thuja plicata",
    "common": "Whipcord Western Red Cedar"
  },
  {
    "id": 738,
    "botanical": "Thuja x",
    "common": "Tiny Tower Green Giant Arborvitae"
  },
  {
    "id": 739,
    "botanical": "Thujopsis dolobrata",
    "common": "Dwarf Hiba Cedar"
  },
  {
    "id": 740,
    "botanical": "Thunbergia alata",
    "common": "Black-Eyed Susan Vine"
  },
  {
    "id": 741,
    "botanical": "Tiarella",
    "common": "Foam Flower"
  },
  {
    "id": 742,
    "botanical": "Torenia",
    "common": "Wishbone Flower"
  },
  {
    "id": 743,
    "botanical": "Trachelospermum asiaticum ",
    "common": "Summer Sunset Jasmine"
  },
  {
    "id": 744,
    "botanical": "Trachelospermum asiaticum ",
    "common": "Snow-N-Summer Jasmine"
  },
  {
    "id": 745,
    "botanical": "Trachelospermum jasminoides",
    "common": "Confederate/Star Jasmine"
  },
  {
    "id": 746,
    "botanical": "Tracheospermum asiaticum",
    "common": "Asiatic Jasmine"
  },
  {
    "id": 747,
    "botanical": "Trachycarpus fortunei",
    "common": "Windmill Palm"
  },
  {
    "id": 748,
    "botanical": "Tradescantia",
    "common": "'Blue and Gold' Spiderwort"
  },
  {
    "id": 749,
    "botanical": "Vaccinium ashei (virgatum)",
    "common": "Assorted Rabbiteye Blueberries"
  },
  {
    "id": 750,
    "botanical": "Vaccinium ashei (virgatum)",
    "common": "Brightwell Rabbiteye Blueberry"
  },
  {
    "id": 751,
    "botanical": "Vaccinium ashei (virgatum)",
    "common": "Powderblue Blueberry"
  },
  {
    "id": 752,
    "botanical": "Vaccinium ashei (virgatum)",
    "common": "Premier Blueberry"
  },
  {
    "id": 753,
    "botanical": "Vaccinium ashei (virgatum)",
    "common": "Tifblue Blueberry"
  },
  {
    "id": 754,
    "botanical": "Vaccinium ashei (virgatum)",
    "common": "Climax Blueberry"
  },
  {
    "id": 755,
    "botanical": "Vaccinium ashei (virgatum)",
    "common": "Pink Lemonade Blueberry"
  },
  {
    "id": 756,
    "botanical": "Vaccinium ashei (virgatum)",
    "common": "Alice Blue Blueberry"
  },
  {
    "id": 757,
    "botanical": "Vaccinium darrowii",
    "common": "Native Blue Blueberry"
  },
  {
    "id": 758,
    "botanical": "Vaccinium darrowii",
    "common": "Rosa's Blush Blueberry"
  },
  {
    "id": 759,
    "botanical": "Verbena bonariensis",
    "common": "Tall Verbena"
  },
  {
    "id": 760,
    "botanical": "Verbena sp.",
    "common": "Tender Perennial Verbena"
  },
  {
    "id": 761,
    "botanical": "Vernonia",
    "common": "Ironweed"
  },
  {
    "id": 762,
    "botanical": "Veronica",
    "common": "Speedwell"
  },
  {
    "id": 763,
    "botanical": "Viburnum awabuki",
    "common": "Chindo Viburnum"
  },
  {
    "id": 764,
    "botanical": "Viburnum carlesii",
    "common": "Korean Spice Viburnum "
  },
  {
    "id": 765,
    "botanical": "Viburnum dentatum",
    "common": "Arrowwood Viburnum "
  },
  {
    "id": 766,
    "botanical": "Viburnum macrocephalum",
    "common": "Chinese Snowball Viburnum "
  },
  {
    "id": 767,
    "botanical": "Viburnum opulus",
    "common": "Eastern Snowball Viburnum "
  },
  {
    "id": 768,
    "botanical": "Viburnum plicatum",
    "common": "Opening Day Doublefile Viburnum "
  },
  {
    "id": 769,
    "botanical": "Viburnum plicatum",
    "common": "Shasta Doublefile Viburnum"
  },
  {
    "id": 770,
    "botanical": "Viburnum tinus",
    "common": "Spring Bouquet Viburnum"
  },
  {
    "id": 771,
    "botanical": "Viburnum tinus",
    "common": "Shades of Pink Viburnum"
  },
  {
    "id": 772,
    "botanical": "Viburnum x",
    "common": "Moonlit Lace Viburnum"
  },
  {
    "id": 773,
    "botanical": "Viburnum x",
    "common": "Mrs. Schiller's Delight Viburnum"
  },
  {
    "id": 774,
    "botanical": "Viburnum x",
    "common": "Burkwood Fragrant Viburnum "
  },
  {
    "id": 775,
    "botanical": "Viburnum x ",
    "common": "Fragrant Viburnum "
  },
  {
    "id": 776,
    "botanical": "Vinca major",
    "common": "Periwinkle"
  },
  {
    "id": 777,
    "botanical": "Vinca minor",
    "common": "Periwinkle"
  },
  {
    "id": 778,
    "botanical": "Vitex agnus-castus",
    "common": "Chaste Tree"
  },
  {
    "id": 779,
    "botanical": "Vitis rotundifolia",
    "common": "Assorted Muscadines "
  },
  {
    "id": 780,
    "botanical": "Weigela florida",
    "common": "Weigela"
  },
  {
    "id": 781,
    "botanical": "Weigela florida",
    "common": "Wine and Roses Weigela"
  },
  {
    "id": 782,
    "botanical": "Wisteria frutescens",
    "common": "Amethyst Falls Wisteria"
  },
  {
    "id": 783,
    "botanical": "Yucca filamentosa",
    "common": "Color Guard Yucca"
  },
  {
    "id": 784,
    "botanical": "Zantedeschia",
    "common": "Calla Lily"
  },
  {
    "id": 785,
    "botanical": "juniperus x pfitzeriana",
    "common": "Sea of Gold Juniper "
  }
]
]

# Normalize botanical names (trim whitespace and lowercase for grouping)
def normalize_botanical_name(name):
    return name.strip().lower()

# Group data by botanical name
botanical_groups = defaultdict(list)

for entry in data:
    normalized_name = normalize_botanical_name(entry["botanical"])
    botanical_groups[normalized_name].append(entry)

# Sort groups alphabetically and format output
sorted_groups = {
    botanical: sorted(entries, key=lambda x: x["id"])
    for botanical, entries in sorted(botanical_groups.items())
}

# Save to a JSON file or print
output_file = "botanical_groups.json"
with open(output_file, "w") as file:
    json.dump(sorted_groups, file, indent=4)
print(f"Data grouped and saved to {output_file}")
