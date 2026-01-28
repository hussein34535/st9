// @ts-nocheck
export default {
    async beforeCreate(event) {
        console.log('LIFECYCLE: beforeCreate triggered');
        await markPremiumLinks(event);
    },

    async beforeUpdate(event) {
        console.log('LIFECYCLE: beforeUpdate triggered');
        await markPremiumLinks(event);
    },
};

async function markPremiumLinks(event) {


    const { data, where } = event.params;

    // 1. Get Channel Name
    let channelName = data.channel;

    // If updating and channel not in data, fetch existing
    if (!channelName && where && where.id) {
        try {
            const existingEntry = await strapi.entityService.findOne('api::match.match', where.id);
            if (existingEntry && existingEntry.channel) {
                channelName = existingEntry.channel;
            }
        } catch (e) {
            console.error('Error fetching existing match:', e);
        }
    }

    if (!channelName) {
        console.log('LIFECYCLE: No channel name found, skipping.');
        return;
    }

    console.log(`LIFECYCLE: Processing Channel: ${channelName}`);

    // 2. Find Channel Entity by Name
    try {
        const channels = await strapi.entityService.findMany('api::channel.channel', {
            filters: { name: channelName },
            populate: ['channel_categories'],
            limit: 1,
        });

        if (!channels || channels.length === 0) {
            console.log('LIFECYCLE: Channel not found in DB.');
            return;
        }

        const channel = channels[0];

        // 3. Check for Premium Category
        const isPremium = channel.channel_categories && channel.channel_categories.some((cat) =>
            cat.name && cat.name.toLowerCase().includes('premium')
        );

        console.log(`LIFECYCLE: Is Premium? ${isPremium}`);

        if (isPremium) {
            // 4. Modify StreamLink
            if (data.streamLink) {
                console.log('LIFECYCLE: Modifying streamLink...');
                data.streamLink = data.streamLink.map(block => {
                    if (block.type === 'paragraph' || block.type === 'heading') {
                        if (block.children) {
                            block.children = block.children.map(child => {
                                if (child.type === 'text' && child.text) {
                                    const lowerText = child.text.toLowerCase();
                                    // Check for 4K/FHD and avoid double marking
                                    if ((lowerText.includes('4k') || lowerText.includes('fhd')) && !lowerText.includes('premium')) {
                                        child.text = `${child.text} (⭐ Subscribers Only)`;
                                    }
                                }
                                return child;
                            });
                        }
                    }
                    return block;
                });
            }
        }
    } catch (error) {
        console.error('Error in markPremiumLinks lifecycle:', error);
    }
}
