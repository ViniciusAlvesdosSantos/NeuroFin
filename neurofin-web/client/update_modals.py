import os
import glob

def refactor_modal(filepath):
    with open(filepath, 'r') as f:
        text = f.read()

    # Backdrop
    text = text.replace('flex items-end sm:items-center justify-center', 'flex flex-col justify-end sm:flex-row sm:justify-end p-0')
    text = text.replace('bg-black/50', 'bg-black/40')
    
    # Motion Div and classes
    if "initial={{ y: 100, opacity: 0 }}" in text:
        text = text.replace(
            "initial={{ y: 100, opacity: 0 }}", 
            "initial={{ opacity: 0, y: '100%' }}\n            animate={{ opacity: 1, y: 0 }}\n            exit={{ opacity: 0, y: '100%' }}"
        )
        # We need to remove the old animate and exit
        text = text.replace("            animate={{ y: 0, opacity: 1 }}\n", "")
        text = text.replace("            exit={{ y: 100, opacity: 0 }}\n", "")

    # For QuickAddTransaction that has bg-white w-full sm:w-[480px] sm:rounded-3xl rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl
    old_classes = [
        'className="bg-white w-full sm:w-[480px] sm:rounded-3xl rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl"',
        'className="bg-white w-full sm:w-[480px] sm:rounded-[2rem] rounded-t-[2rem] p-6 max-h-[85vh] overflow-y-auto shadow-2xl"'
    ]
    new_class = 'className="bg-card text-card-foreground shadow-[[-10px_0_40px_rgba(0,0,0,0.05)]] border-l border-border w-full sm:w-[480px] flex flex-col rounded-t-[2rem] sm:rounded-none sm:h-full max-h-[92vh] sm:max-h-screen relative"'
    
    for old in old_classes:
        text = text.replace(old, new_class)

    # Add inner padding wrapper instead of padding the container
    header_target = '            {/* Header */}'
    header_replacement = '            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-4 mb-2 sm:hidden shrink-0" />\n            <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-2 sm:pt-8">\n            {/* Header */}'
    text = text.replace(header_target, header_replacement)

    # Close the inner padding wrapper before the closing </motion.div>
    if "          </motion.div>\n        </motion.div>" in text:
        text = text.replace("          </motion.div>\n        </motion.div>", "            </div>\n          </motion.div>\n        </motion.div>")

    # Colors Update
    text = text.replace('text-slate-800', 'text-foreground')
    text = text.replace('text-slate-700', 'text-foreground')
    text = text.replace('text-slate-500', 'text-muted-foreground')
    text = text.replace('text-slate-400', 'text-muted-foreground')
    text = text.replace('placeholder:text-slate-300', 'placeholder:text-muted-foreground')
    
    text = text.replace('bg-slate-50', 'bg-muted')
    text = text.replace('bg-slate-200', 'bg-muted')
    text = text.replace('border-slate-200', 'border-border')
    text = text.replace('border-slate-300', 'border-border')
    text = text.replace('border-slate-800', 'border-foreground')
    text = text.replace('hover:border-slate-200', 'hover:border-border')
    text = text.replace('hover:border-slate-300', 'hover:border-border')
    
    # Button
    text = text.replace('Button variant="ghost" size="sm" onClick={reset}', 'Button variant="ghost" size="sm" onClick={reset} className="rounded-full bg-muted/50 hover:bg-muted p-2 h-auto"')
    
    # Text Size Header
    text = text.replace('<h2 className="text-xl font-bold text-foreground">', '<h2 className="text-xl font-bold tracking-tight">')

    # Data Entry Inputs Redesign (Massive Input)
    text = text.replace(
        'className="text-4xl font-bold text-center border-0 bg-transparent w-48 \n                        focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"',
        'className="text-6xl md:text-7xl font-bold text-center border-none bg-transparent w-full max-w-[280px] focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/30"'
    )
    # Fix spacing for massive input
    text = text.replace('className="text-3xl text-muted-foreground font-bold">R$</span>', 'className="text-4xl text-muted-foreground font-light mb-1">R$</span>')
    
    with open(filepath, 'w') as f:
        f.write(text)

files = [
    '/home/vini/Desktop/estudos/Molda-Invest/neurofin-web/client/src/components/QuickAddTransaction.tsx',
    '/home/vini/Desktop/estudos/Molda-Invest/neurofin-web/client/src/components/QuickAddAccount.tsx',
    '/home/vini/Desktop/estudos/Molda-Invest/neurofin-web/client/src/components/QuickAddCategory.tsx'
]

for f in files:
    refactor_modal(f)

