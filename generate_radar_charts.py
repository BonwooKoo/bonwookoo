#!/usr/bin/env python3
"""
Radar Chart Generator for Seoul Street Clusters

This script generates radar charts for each cluster based on cluster_profiles.json
"""

import json
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Circle
import os

# Set style
plt.style.use('seaborn-v0_8-darkgrid')

# Cluster colors (matching the dashboard)
CLUSTER_COLORS = {
    '1': '#4ECDC4',  # Cyan
    '2': '#FF6B6B',  # Red
    '3': '#4A90E2',  # Blue
    '4': '#E94B9E',  # Pink
    '5': '#A8E063',  # Green
    '6': '#FFD93D'   # Yellow
}

# Variable labels (Korean + English)
LABELS = {
    'building': 'Building\n건물',
    'sidewalk': 'Sidewalk\n보도',
    'road': 'Road\n도로',
    'tree': 'Tree\n나무',
    'sky': 'Sky\n하늘',
    'person': 'Person\n사람'
}

def create_radar_chart(cluster_data, cluster_num, output_dir='assets/images/clusters'):
    """
    Create a radar chart for a specific cluster

    Args:
        cluster_data: Dictionary with cluster characteristics
        cluster_num: Cluster number (1-6)
        output_dir: Directory to save the image
    """
    # Prepare data
    categories = list(LABELS.keys())
    values = [cluster_data[cat] for cat in categories]

    # Number of variables
    num_vars = len(categories)

    # Compute angle for each axis
    angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()

    # Complete the circle
    values += values[:1]
    angles += angles[:1]

    # Create figure
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(projection='polar'))
    fig.patch.set_facecolor('#0a0a0a')  # Dark background
    ax.set_facecolor('#0a0a0a')

    # Plot data
    color = CLUSTER_COLORS[cluster_num]
    ax.plot(angles, values, 'o-', linewidth=2.5, color=color, label=f'Cluster {cluster_num}')
    ax.fill(angles, values, alpha=0.25, color=color)

    # Fix axis to go in the right order and start at 12 o'clock
    ax.set_theta_offset(np.pi / 2)
    ax.set_theta_direction(-1)

    # Draw axis lines for each angle and label
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels([LABELS[cat] for cat in categories],
                       color='white', size=11, weight='bold')

    # Set y-axis
    ax.set_ylim(0, 1)
    ax.set_yticks([0.2, 0.4, 0.6, 0.8, 1.0])
    ax.set_yticklabels(['0.2', '0.4', '0.6', '0.8', '1.0'],
                       color=(1, 1, 1, 0.5), size=9)

    # Styling
    ax.grid(True, color=(1, 1, 1, 0.2), linewidth=0.5)
    ax.spines['polar'].set_color((1, 1, 1, 0.3))
    ax.spines['polar'].set_linewidth(1)

    # Title
    ax.set_title(f'Cluster {cluster_num} Characteristics',
                size=16, color='white', weight='bold', pad=20)

    # Save with transparent background
    output_path = os.path.join(output_dir, f'cluster{cluster_num}.png')
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, transparent=True, bbox_inches='tight')
    plt.close()

    print(f"✓ Generated: {output_path}")

def generate_cluster_descriptions(profiles):
    """
    Generate descriptions for each cluster based on their profiles
    """
    descriptions = {}

    for profile in profiles:
        cluster = profile['cluster']

        # Find dominant characteristics (> 0.7)
        high = [k for k, v in profile.items() if k != 'cluster' and v > 0.7]
        # Find weak characteristics (< 0.3)
        low = [k for k, v in profile.items() if k != 'cluster' and v < 0.3]

        # Generate description
        if cluster == '1':
            desc_en = "Road-dominant commercial corridors with moderate building density. Wide arterial streets with high vehicle traffic but limited pedestrian infrastructure."
            desc_ko = "도로 중심의 상업 가로. 넓은 간선도로로 차량 통행이 많지만 보행 인프라는 제한적입니다."
        elif cluster == '2':
            desc_en = "Tree-lined residential streets with generous sidewalks. High vegetation coverage creating shaded, comfortable pedestrian environments."
            desc_ko = "나무가 많은 주거 가로. 넓은 보도와 높은 녹지율로 그늘진 쾌적한 보행환경을 제공합니다."
        elif cluster == '3':
            desc_en = "Dense urban cores with high-rise buildings. Limited sky visibility and minimal green space, typical of central business districts."
            desc_ko = "고층 건물이 밀집한 도심 지역. 제한된 하늘 가시율과 최소한의 녹지, 전형적인 업무 중심지입니다."
        elif cluster == '4':
            desc_en = "Active mixed-use neighborhoods with high pedestrian activity. Wide sidewalks accommodate significant foot traffic in vibrant urban areas."
            desc_ko = "보행 활동이 활발한 복합용도 지역. 넓은 보도가 많은 보행자를 수용하는 활기찬 도시 공간입니다."
        elif cluster == '5':
            desc_en = "Balanced urban streets with mixed characteristics. Moderate levels across all metrics, representing typical Seoul neighborhoods."
            desc_ko = "균형잡힌 도시 가로. 모든 지표에서 중간 수준을 보이는 전형적인 서울 주거지역입니다."
        elif cluster == '6':
            desc_en = "Open suburban or park-adjacent areas. High sky visibility with significant green coverage but minimal built infrastructure."
            desc_ko = "개방된 교외 또는 공원 인접 지역. 높은 하늘 가시율과 녹지 면적, 최소한의 건축 인프라가 특징입니다."

        descriptions[cluster] = {
            'en': desc_en,
            'ko': desc_ko
        }

    return descriptions

def main():
    # Create output directory if it doesn't exist
    output_dir = 'assets/images/clusters'
    os.makedirs(output_dir, exist_ok=True)

    # Load cluster profiles
    with open('assets/data/cluster_profiles.json', 'r') as f:
        profiles = json.load(f)

    print("Generating radar charts...")
    print("=" * 50)

    # Generate radar chart for each cluster
    for profile in profiles:
        cluster_num = profile['cluster']
        create_radar_chart(profile, cluster_num, output_dir)

    print("=" * 50)
    print(f"✓ All charts generated in {output_dir}/")

    # Generate and save descriptions
    descriptions = generate_cluster_descriptions(profiles)

    desc_output = 'assets/data/cluster_descriptions.json'
    with open(desc_output, 'w', encoding='utf-8') as f:
        json.dump(descriptions, f, indent=2, ensure_ascii=False)

    print(f"✓ Descriptions saved to {desc_output}")

    # Print summary
    print("\n" + "=" * 50)
    print("CLUSTER SUMMARY:")
    print("=" * 50)
    for profile in profiles:
        cluster = profile['cluster']
        print(f"\nCluster {cluster}:")
        print(f"  - Building: {profile['building']:.2f}")
        print(f"  - Sidewalk: {profile['sidewalk']:.2f}")
        print(f"  - Road: {profile['road']:.2f}")
        print(f"  - Tree: {profile['tree']:.2f}")
        print(f"  - Sky: {profile['sky']:.2f}")
        print(f"  - Person: {profile['person']:.2f}")

if __name__ == '__main__':
    main()
