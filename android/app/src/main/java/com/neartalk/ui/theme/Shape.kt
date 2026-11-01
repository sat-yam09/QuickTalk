package com.neartalk.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

// Shapes specification:
// 16dp cards, 999dp pills for buttons, 18dp chat bubbles (with 6dp sender-nearest corner)
val Shapes = Shapes(
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(999.dp)
)

val PillShape = RoundedCornerShape(999.dp)
val CardShape = RoundedCornerShape(16.dp)
val BubbleRadius = 18.dp
val BubbleTightRadius = 6.dp
