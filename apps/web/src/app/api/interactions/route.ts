import { NextResponse } from 'next/server';
import { verifyKey, InteractionType, InteractionResponseType } from 'discord-interactions';

export async function POST(req: Request) {
  const signature = req.headers.get('x-signature-ed25519');
  const timestamp = req.headers.get('x-signature-timestamp');
  const rawBody = await req.text();

  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json({ error: 'Missing DISCORD_PUBLIC_KEY' }, { status: 500 });
  }

  if (!signature || !timestamp) {
    return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 });
  }

  const isValidRequest = verifyKey(rawBody, signature, timestamp, publicKey);
  if (!isValidRequest) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const interaction = JSON.parse(rawBody);

  // Handle Ping
  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  // Handle Button Clicks
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    const customId = interaction.data.custom_id;
    
    // We only care about approve/reject buttons
    if (customId.startsWith('approve_') || customId.startsWith('reject_')) {
      const isApprove = customId.startsWith('approve_');
      const actionType = isApprove ? 'Approved' : 'Rejected';
      const color = isApprove ? 0x22c55e : 0xef4444; // Green for approve, Red for reject
      
      const message = interaction.message;
      const embeds = message.embeds || [];
      
      const userThatClicked = interaction.member?.user || interaction.user;
      const approverName = userThatClicked ? `${userThatClicked.username}` : 'Staff';

      // Update the first embed
      if (embeds.length > 0) {
        embeds[0].color = color;
        // Append to footer
        const existingFooter = embeds[0].footer?.text || '';
        embeds[0].footer = {
          text: `${existingFooter} | ${actionType} by ${approverName}`,
        };
      }

      return NextResponse.json({
        type: InteractionResponseType.UPDATE_MESSAGE,
        data: {
          embeds: embeds,
          components: [], // Remove the buttons
        },
      });
    }
  }

  return NextResponse.json({ error: 'Unknown interaction' }, { status: 400 });
}
